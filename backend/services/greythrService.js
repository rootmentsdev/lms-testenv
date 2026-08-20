import axios from 'axios';

/**
 * GreytHR API Integration Service
 * All credentials are read from environment variables on the server-side.
 */

// In-memory token cache
let tokenCache = {
  token: null,
  expiresAt: null,
};

/**
 * Helper to get configured GreytHR domain.
 */
export function getGreytHRDomain() {
  const domain = process.env.GREYTHR_DOMAIN || 'api.greythr.com';
  // Strip protocol if user included it in .env
  return domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
}

/**
 * Clear the in-memory access token cache.
 */
export function clearTokenCache() {
  tokenCache = { token: null, expiresAt: null };
}

/**
 * Step 1: Obtain Access Token
 * Performs HTTP Basic Auth to fetch OAuth2 token and caches it in memory.
 * 
 * Endpoint: POST https://${GREYTHR_DOMAIN}/uas/v1/oauth2/client-token
 */
export async function getAccessToken(options = {}) {
  const { forceRefresh = false } = options;
  const now = Date.now();

  // Return cached token if valid and not forcing refresh (with 60-second safety buffer)
  if (!forceRefresh && tokenCache.token && tokenCache.expiresAt && tokenCache.expiresAt > now + 60000) {
    return tokenCache.token;
  }

  const domain = getGreytHRDomain();
  const username = process.env.GREYTHR_API_USERNAME;
  const password = process.env.GREYTHR_API_PASSWORD;

  if (!username || !password) {
    throw new Error('GreytHR API credentials missing. Please set GREYTHR_API_USERNAME and GREYTHR_API_PASSWORD in backend/.env');
  }

  const authUrl = `https://${domain}/uas/v1/oauth2/client-token`;
  const basicAuthHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

  try {
    console.log(`🔐 Fetching greytHR access token from https://${domain}...`);
    const response = await axios.post(
      authUrl,
      {},
      {
        headers: {
          'Authorization': basicAuthHeader,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const data = response.data || {};
    // Extract access_token with fallbacks
    const token = data.access_token || data.accessToken || data.token;

    if (!token) {
      throw new Error(`Invalid token response from greytHR: ${JSON.stringify(data)}`);
    }

    // Determine expiration in seconds (default 3600 seconds / 1 hour if not specified)
    const expiresIn = Number(data.expires_in || data.expiresIn) || 3600;
    tokenCache = {
      token: token,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    console.log('✅ GreytHR access token obtained successfully.');
    return tokenCache.token;
  } catch (error) {
    clearTokenCache();
    const status = error.response?.status;
    const errorData = error.response?.data || error.message;
    console.error('❌ Failed to obtain greytHR access token:', status, errorData);
    throw new Error(`GreytHR Authentication Failed (${status || 'Network Error'}): ${JSON.stringify(errorData)}`);
  }
}

/**
 * Step 2: Generic Request Helper
 * Sends HTTP requests to greytHR with ACCESS-TOKEN and x-greythr-domain headers.
 * Handles automatic 401 retry by refreshing the token once.
 */
export async function request(endpointOrUrl, options = {}) {
  const domain = getGreytHRDomain();
  
  // Build full URL if relative path provided (GreytHR REST API is hosted on api.greythr.com)
  let fullUrl = endpointOrUrl;
  if (!/^https?:\/\//i.test(endpointOrUrl)) {
    const cleanPath = endpointOrUrl.startsWith('/') ? endpointOrUrl : `/${endpointOrUrl}`;
    fullUrl = `https://api.greythr.com${cleanPath}`;
  }

  const token = await getAccessToken({ forceRefresh: options._isRetry });

  const headers = {
    'ACCESS-TOKEN': token,
    'x-greythr-domain': domain,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const method = (options.method || 'GET').toUpperCase();

  try {
    const response = await axios({
      url: fullUrl,
      method: method,
      headers: headers,
      data: options.body || options.data,
      params: options.params,
      timeout: options.timeout || 20000,
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status;

    // Handle expired token (401 Unauthorized) retry once
    if (status === 401 && !options._isRetry) {
      console.warn('⚠️ GreytHR returned 401 Unauthorized. Retrying request with refreshed token...');
      clearTokenCache();
      return request(endpointOrUrl, { ...options, _isRetry: true });
    }

    const errorPayload = error.response?.data || { message: error.message || 'Network error' };
    console.error(`❌ GreytHR API Request Error [${method} ${fullUrl}] Status: ${status || 'N/A'}`, errorPayload);
    
    const err = new Error(`GreytHR API Error (${status || 'Network Error'}): ${errorPayload.message || JSON.stringify(errorPayload)}`);
    err.status = status;
    err.details = errorPayload;
    throw err;
  }
}

/**
 * Example Data Endpoint Helper: Get Employee Categories
 * GET https://api.greythr.com/employee/v2/employees/categories?descRequired=true
 */
export async function getEmployeeCategories(params = {}) {
  const descRequired = params.descRequired !== undefined ? params.descRequired : true;
  const endpoint = `/employee/v2/employees/categories?descRequired=${Boolean(descRequired)}`;
  return request(endpoint, { method: 'GET' });
}

/**
 * GreytHR Data Endpoint Helper: Get Employees List / Details
 * GET https://${GREYTHR_DOMAIN}/employee/v2/employees
 */
export async function getEmployees(params = {}) {
  let endpoint = '/employee/v2/employees';
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  if (queryString) {
    endpoint += `?${queryString}`;
  }

  try {
    return await request(endpoint, { method: 'GET' });
  } catch (err) {
    // If /employee/v2/employees gives 404, fallback to /employee/v2/employees/details
    if (err.status === 404) {
      console.warn('⚠️ /employee/v2/employees returned 404. Retrying with /employee/v2/employees/details...');
      return await request(`/employee/v2/employees/details${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
    }
    throw err;
  }
}

/**
 * Step 3 Usage Example
 * Fetches employee categories and logs the result to console.
 */
export async function logEmployeeCategoriesExample() {
  console.log('\n========================================');
  console.log('🚀 Running GreytHR API Integration Example');
  console.log('========================================');
  try {
    const categories = await getEmployeeCategories({ descRequired: true });
    console.log('✅ Successfully fetched Employee Categories from greytHR:');
    console.log(JSON.stringify(categories, null, 2));
    console.log('========================================\n');
    return categories;
  } catch (error) {
    console.error('❌ GreytHR Usage Example Failed:', error.message);
    console.log('========================================\n');
    throw error;
  }
}

export default {
  getGreytHRDomain,
  clearTokenCache,
  getAccessToken,
  request,
  getEmployeeCategories,
  getEmployees,
  logEmployeeCategoriesExample,
};

