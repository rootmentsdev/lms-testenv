export const detectDeviceInfo = (userAgent, ipAddress) => {
    // Simple device detection without external packages
    const ua = userAgent.toLowerCase();
    
    // Device type detection
    let deviceType = 'desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
        deviceType = 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        deviceType = 'tablet';
    }
    
    // OS detection
    let deviceOS = 'unknown';
    if (ua.includes('windows')) {
        deviceOS = 'windows';
    } else if (ua.includes('mac os') || ua.includes('macintosh')) {
        deviceOS = 'mac';
    } else if (ua.includes('linux')) {
        deviceOS = 'linux';
    } else if (ua.includes('android')) {
        deviceOS = 'android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
        deviceOS = 'ios';
    }
    
    // Browser detection
    let browser = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (ua.includes('chrome')) {
        browser = 'Chrome';
        const match = ua.match(/chrome\/(\d+)/);
        if (match) browserVersion = match[1];
    } else if (ua.includes('firefox')) {
        browser = 'Firefox';
        const match = ua.match(/firefox\/(\d+)/);
        if (match) browserVersion = match[1];
    } else if (ua.includes('safari')) {
        browser = 'Safari';
        const match = ua.match(/version\/(\d+)/);
        if (match) browserVersion = match[1];
    } else if (ua.includes('edge')) {
        browser = 'Edge';
        const match = ua.match(/edge\/(\d+)/);
        if (match) browserVersion = match[1];
    }
    
    return {
        deviceType,
        deviceOS,
        browser,
        browserVersion,
        userAgent,
        ipAddress
    };
};

export const getLocationFromIP = async (ipAddress) => {
    try {
        // You can integrate with services like ipapi.co, ipinfo.io, or MaxMind
        // For now, returning basic info
        if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
            return {
                country: 'Local',
                city: 'Local',
                region: 'Local'
            };
        }
        
        // Example with ipapi.co (free tier available)
        // const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
        // const data = await response.json();
        // return {
        //     country: data.country_name || 'Unknown',
        //     city: data.city || 'Unknown',
        //     region: data.region || 'Unknown'
        // };
        
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown'
        };
    } catch (error) {
        console.error('Error getting location from IP:', error);
        return {
            country: 'Unknown',
            city: 'Unknown',
            region: 'Unknown'
        };
    }
};
