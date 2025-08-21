import UserLoginSession from '../model/UserLoginSession.js';
import { detectDeviceInfo, getLocationFromIP } from '../utils/deviceDetection.js';

// Track user login
export const trackUserLogin = async (req, res) => {
    try {
        const { userId, username, email } = req.body;
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'Unknown';
        
        // Detect device information
        const deviceInfo = detectDeviceInfo(userAgent, ipAddress);
        const location = await getLocationFromIP(ipAddress);
        
        // Create login session
        const loginSession = new UserLoginSession({
            userId,
            username,
            email,
            ...deviceInfo,
            location,
            ipAddress
        });
        
        await loginSession.save();
        
        res.status(201).json({
            success: true,
            message: 'Login session tracked successfully',
            sessionId: loginSession._id
        });
    } catch (error) {
        console.error('Error tracking user login:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track login session',
            error: error.message
        });
    }
};

// Track user logout
export const trackUserLogout = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        const session = await UserLoginSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }
        
        // Calculate session duration
        const logoutTime = new Date();
        const sessionDuration = Math.round((logoutTime - session.loginTime) / (1000 * 60)); // in minutes
        
        session.logoutTime = logoutTime;
        session.isActive = false;
        session.sessionDuration = sessionDuration;
        
        await session.save();
        
        res.status(200).json({
            success: true,
            message: 'Logout tracked successfully',
            sessionDuration
        });
    } catch (error) {
        console.error('Error tracking user logout:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track logout',
            error: error.message
        });
    }
};

// Get login analytics
export const getLoginAnalytics = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        
        let dateFilter = {};
        const now = new Date();
        
        switch (period) {
            case '24h':
                dateFilter = { loginTime: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
                break;
            case '7d':
                dateFilter = { loginTime: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case '30d':
                dateFilter = { loginTime: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
                break;
            case 'all':
                dateFilter = {};
                break;
            default:
                dateFilter = { loginTime: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        }
        
        // Get total logins
        const totalLogins = await UserLoginSession.countDocuments(dateFilter);
        
        // Get device type distribution
        const deviceTypeStats = await UserLoginSession.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$deviceType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get OS distribution
        const osStats = await UserLoginSession.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$deviceOS', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get browser distribution
        const browserStats = await UserLoginSession.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$browser', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Get active sessions
        const activeSessions = await UserLoginSession.countDocuments({ isActive: true });
        
        // Get unique users
        const uniqueUsers = await UserLoginSession.distinct('userId', dateFilter);
        const uniqueUserCount = uniqueUsers.length;
        
        // Get recent logins
        const recentLogins = await UserLoginSession.find(dateFilter)
            .sort({ loginTime: -1 })
            .limit(10)
            .populate('userId', 'username email')
            .select('-userAgent -ipAddress');
        
        res.status(200).json({
            success: true,
            data: {
                totalLogins,
                uniqueUserCount,
                activeSessions,
                deviceTypeStats,
                osStats,
                browserStats,
                recentLogins,
                period
            }
        });
    } catch (error) {
        console.error('Error getting login analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get login analytics',
            error: error.message
        });
    }
};

// Get user login history
export const getUserLoginHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        
        const skip = (page - 1) * limit;
        
        const sessions = await UserLoginSession.find({ userId })
            .sort({ loginTime: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-userAgent -ipAddress');
        
        const total = await UserLoginSession.countDocuments({ userId });
        
        res.status(200).json({
            success: true,
            data: {
                sessions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalSessions: total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error getting user login history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user login history',
            error: error.message
        });
    }
};

// Get real-time active users
export const getActiveUsers = async (req, res) => {
    try {
        const activeSessions = await UserLoginSession.find({ isActive: true })
            .populate('userId', 'username email')
            .sort({ loginTime: -1 })
            .select('-userAgent -ipAddress');
        
        res.status(200).json({
            success: true,
            data: {
                activeUsers: activeSessions,
                count: activeSessions.length
            }
        });
    } catch (error) {
        console.error('Error getting active users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get active users',
            error: error.message
        });
    }
};
