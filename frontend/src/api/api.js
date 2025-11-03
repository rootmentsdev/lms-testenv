/**
 * API Configuration
 * Centralized base URL configuration for the application
 * 
 * @constant {Object} API_CONFIG
 * @property {string} baseUrl - Base URL for API calls
 */
const API_CONFIG = {
    // Production URL (Render deployment)
    // baseUrl: "https://lms-testenv.onrender.com/",
    
    // Development URL (for local development)
    // In Vite, use import.meta.env instead of process.env
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:7000/",
};

/**
 * Constants for HTTP methods
 */
const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    PUT: 'PUT',
    DELETE: 'DELETE',
};

/**
 * Default fetch options for API calls
 */
const DEFAULT_FETCH_OPTIONS = {
    method: HTTP_METHODS.GET,
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include',
};

/**
 * Retrieves authentication token from localStorage
 * 
 * @returns {string|null} - Authentication token or null if not found
 */
const getAuthToken = () => {
    try {
        return localStorage.getItem('token');
    } catch (error) {
        console.error('Failed to retrieve auth token:', error);
        return null;
    }
};

/**
 * Builds authorization header if token exists
 * 
 * @param {string|null} token - Authentication token
 * @returns {Object} - Headers object with Authorization if token exists
 */
const buildAuthHeaders = (token) => {
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
};

/**
 * Merges default and custom options for fetch request
 * 
 * @param {Object} defaultOptions - Default fetch options
 * @param {Object} customOptions - Custom options to merge
 * @returns {Object} - Merged options object
 */
const mergeFetchOptions = (defaultOptions, customOptions) => {
    const mergedOptions = {
        ...defaultOptions,
        ...customOptions,
        headers: {
            ...defaultOptions.headers,
            ...customOptions.headers,
        },
    };
    
    const token = getAuthToken();
    const authHeaders = buildAuthHeaders(token);
    
    mergedOptions.headers = {
        ...mergedOptions.headers,
        ...authHeaders,
    };
    
    return mergedOptions;
};

/**
 * Handles API response and extracts JSON data
 * 
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Parsed JSON data
 * @throws {Error} - If response is not ok or parsing fails
 */
const handleApiResponse = async (response) => {
    if (!response.ok) {
        const errorMessage = `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    try {
        return await response.json();
    } catch (parseError) {
        throw new Error(`Failed to parse response: ${parseError.message}`);
    }
};

/**
 * Attempts CORS proxy fallback for development environment
 * 
 * @param {string} url - Original URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - API response data
 * @throws {Error} - If CORS proxy fails
 */
const tryCorsProxyFallback = async (url, options) => {
    const CORS_PROXY_BASE = 'https://cors-anywhere.herokuapp.com/';
    const corsProxyUrl = `${CORS_PROXY_BASE}${url}`;
    
    try {
        const response = await fetch(corsProxyUrl, options);
        return await handleApiResponse(response);
    } catch (corsError) {
        throw new Error(`CORS proxy failed: ${corsError.message}`);
    }
};

/**
 * Generic API call function with error handling and CORS fallback
 * 
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise<any>} - API response data
 * @throws {Error} - If API call fails
 */
export const apiCall = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const finalOptions = mergeFetchOptions(DEFAULT_FETCH_OPTIONS, options);
    
    try {
        const response = await fetch(url, finalOptions);
        return await handleApiResponse(response);
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error.message);
        
        // Try CORS proxy fallback only in development
        // In Vite, use import.meta.env.DEV to check if in development mode
        if (import.meta.env.DEV) {
            try {
                return await tryCorsProxyFallback(url, finalOptions);
            } catch (corsError) {
                console.error('CORS proxy fallback failed:', corsError.message);
                throw corsError;
            }
        }
        
        throw error;
    }
};

/**
 * Builds query parameters for video completion request
 * 
 * @param {Object} params - Video completion parameters
 * @returns {URLSearchParams} - Query parameters object
 */
const buildVideoCompletionParams = ({ userId, trainingId, moduleId, videoId, watchTime, totalDuration }) => {
    const params = new URLSearchParams({
        userId,
        trainingId,
        moduleId,
        videoId,
    });

    if (watchTime) {
        params.append('watchTime', watchTime.toString());
    }
    
    if (totalDuration) {
        params.append('totalDuration', totalDuration.toString());
    }

    return params;
};

/**
 * Marks a video as complete for a user
 * 
 * @param {Object} params - Parameters for marking video complete
 * @param {string} params.userId - User ID
 * @param {string} params.trainingId - Training ID
 * @param {string} params.moduleId - Module ID
 * @param {string} params.videoId - Video ID
 * @param {number} [params.watchTime] - Watch time in seconds (optional)
 * @param {number} [params.totalDuration] - Total duration in seconds (optional)
 * @returns {Promise<any>} - API response data
 * @throws {Error} - If API call fails
 */
export const markVideoAsComplete = async (params) => {
    const queryParams = buildVideoCompletionParams(params);
    const endpoint = `api/user/update/trainingprocess?${queryParams.toString()}`;
    
    return await apiCall(endpoint, {
        method: HTTP_METHODS.PATCH,
    });
};

/**
 * Updates video progress tracking
 * 
 * @param {Object} progressData - Video progress data
 * @returns {Promise<any>} - API response data
 * @throws {Error} - If API call fails
 */
export const updateVideoProgress = async (progressData) => {
    return await apiCall('api/video_progress', {
        method: HTTP_METHODS.POST,
        body: JSON.stringify(progressData),
    });
};

export default API_CONFIG;
