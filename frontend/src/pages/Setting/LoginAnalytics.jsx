import { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import SideNav from '../../components/SideNav/SideNav';
import ModileNav from '../../components/SideNav/ModileNav';
import baseUrl from '../../api/api';

const LoginAnalytics = () => {
    const [period, setPeriod] = useState('7d');
    const [selectedUser, setSelectedUser] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch real analytics data
    useEffect(() => {
        fetchAnalytics();
        fetchActiveUsers();
    }, [period]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl.baseUrl}api/user-login/analytics?period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.success) {
                setAnalytics(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch analytics');
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl.baseUrl}api/user-login/active-users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setActiveUsers(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
        }
    };

    const mockActiveUsers = [
        {
            _id: '1',
            username: 'John Doe',
            email: 'john@example.com',
            deviceType: 'desktop',
            deviceOS: 'windows',
            browser: 'Chrome',
            loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            userId: { _id: '1' }
        },
        {
            _id: '2',
            username: 'Jane Smith',
            email: 'jane@example.com',
            deviceType: 'mobile',
            deviceOS: 'ios',
            browser: 'Safari',
            loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
            userId: { _id: '2' }
        }
    ];

    const getDeviceIcon = (deviceType) => {
        switch (deviceType) {
            case 'desktop': 
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'mobile': 
                return (
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 2a1 1 0 00-1 1v14a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1H7zM6 0h8a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V2a2 2 0 012-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'tablet': 
                return (
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
                    </svg>
                );
            default: 
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const getOSIcon = (os) => {
        switch (os) {
            case 'windows': 
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'mac': 
                return (
                    <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                );
            case 'linux': 
                return (
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                );
            case 'android': 
                return (
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'ios': 
                return (
                    <svg className="w-5 h-5 text-gray-800" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                );
            default: 
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const getBrowserIcon = (browser) => {
        switch (browser.toLowerCase()) {
            case 'chrome': 
                return (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'firefox': 
                return (
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'safari': 
                return (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
            case 'edge': 
                return (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
            default: 
                return (
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <ModileNav />
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:block">
                    <SideNav />
                </div>

                {/* Main Content */}
                <div className="md:ml-64">
                    <Header />
                    
                    <div className="p-6">
                        <div className="mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Login Analytics Dashboard</h1>
                                    <p className="text-gray-600">Monitor user login activity, devices, and real-time sessions</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setLoading(true);
                                        fetchAnalytics();
                                        fetchActiveUsers();
                                    }}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                                >
                                    <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>
                            {error && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-800">
                                    <strong>Error:</strong> {error}
                                </p>
                            </div>
                        )}
                        {loading && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Loading:</strong> Fetching real login analytics data...
                                </p>
                            </div>
                        )}
                        {analytics && (
                            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-800">
                                    <strong>✅ Live Data:</strong> Showing real login analytics from your dashboard users.
                                </p>
                            </div>
                        )}
                        </div>

                        {/* Period Selector */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period:</label>
                            <select 
                                value={period} 
                                onChange={(e) => setPeriod(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>

                        {/* Analytics Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Logins</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {loading ? '...' : analytics?.totalLogins || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5 8a2 2 0 11-4 0 2 2 0 014 0zM5 8a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">Unique Users</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {loading ? '...' : analytics?.uniqueUserCount || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-purple-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">Active Sessions</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {loading ? '...' : analytics?.activeSessions || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-orange-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                                    </svg>
                                    <div>
                                        <p className="text-sm text-gray-600">Period</p>
                                        <p className="text-lg font-semibold text-gray-900 capitalize">{period}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Users by Location Summary */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏢 Users by Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {loading ? (
                                    <div className="col-span-full text-center py-4">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-500 text-sm">Loading location summary...</p>
                                    </div>
                                ) : analytics?.recentLogins?.length > 0 ? (
                                    (() => {
                                        // Group users by location
                                        const locationMap = new Map();
                                        analytics.recentLogins.forEach(login => {
                                            const location = login.userId?.workingBranch || 'Unknown Location';
                                            if (!locationMap.has(location)) {
                                                locationMap.set(location, {
                                                    location,
                                                    users: new Set(),
                                                    count: 0
                                                });
                                            }
                                            const locationData = locationMap.get(location);
                                            locationData.users.add(login.userId?.username || login.username);
                                            locationData.count++;
                                        });

                                        // Convert to array and sort by count
                                        const locationSummary = Array.from(locationMap.values())
                                            .map(item => ({
                                                ...item,
                                                userCount: item.users.size
                                            }))
                                            .sort((a, b) => b.count - a.count);

                                        return locationSummary.slice(0, 8).map((item, index) => (
                                            <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 text-sm">{item.location}</h4>
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {item.count} logins
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-600">
                                                    {item.userCount} unique user{item.userCount !== 1 ? 's' : ''}
                                                </p>
                                                <div className="mt-2 text-xs text-gray-500">
                                                    {Array.from(item.users).slice(0, 2).join(', ')}
                                                    {item.userCount > 2 && ` +${item.userCount - 2} more`}
                                                </div>
                                            </div>
                                        ));
                                    })()
                                ) : (
                                    <div className="col-span-full text-center py-4">
                                        <p className="text-gray-500">No location data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Device & OS Distribution */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Device Type Distribution */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Device Types</h3>
                                <div className="space-y-3">
                                    {analytics?.deviceTypeStats?.map((stat, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {getDeviceIcon(stat._id)}
                                                <span className="ml-2 text-gray-700 capitalize">{stat._id}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{stat.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* OS Distribution */}
                            <div className="bg-white p-6 rounded-lg shadow-sm border">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 Operating Systems</h3>
                                <div className="space-y-3">
                                    {analytics?.osStats?.map((stat, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                {getOSIcon(stat._id)}
                                                <span className="ml-2 text-gray-700 capitalize">{stat._id}</span>
                                            </div>
                                            <span className="font-semibold text-gray-900">{stat.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Browser Distribution */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 Browser Usage</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {analytics?.browserStats?.map((stat, index) => (
                                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-center mb-2">
                                            {getBrowserIcon(stat._id)}
                                        </div>
                                        <p className="text-sm text-gray-600 capitalize">{stat._id}</p>
                                        <p className="text-lg font-bold text-gray-900">{stat.count}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Users */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">🟢 Currently Active Users</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OS</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Browser</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {(activeUsers.length > 0 ? activeUsers : []).map((session) => (
                                            <tr key={session._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {session.userId?.username || session.username}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{session.userId?.email || session.email}</div>
                                                        <div className="text-xs text-gray-400">
                                                            👤 {session.userId?.designation || 'No Designation'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm text-blue-600 font-medium">
                                                            📍 {session.userId?.workingBranch || 'Unknown Location'}
                                                        </div>
                                                        {session.location?.city && session.location?.country && (
                                                            <div className="text-xs text-green-600">
                                                                🌍 {session.location.city}, {session.location.country}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getDeviceIcon(session.deviceType)}
                                                        <span className="ml-2 text-sm text-gray-900 capitalize">{session.deviceType}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getOSIcon(session.deviceOS)}
                                                        <span className="ml-2 text-sm text-gray-900 capitalize">{session.deviceOS}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        {getBrowserIcon(session.browser)}
                                                        <span className="ml-2 text-sm text-gray-900">{session.browser}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(session.loginTime)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => setSelectedUser(session)}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md"
                                                    >
                                                        View History
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* User Locations */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 User Locations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {loading ? (
                                    <div className="col-span-full text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-500">Loading location data...</p>
                                    </div>
                                ) : analytics?.recentLogins?.length > 0 ? (
                                    [...new Map(analytics.recentLogins.map(login => [
                                        login.userId?.workingBranch || 'Unknown Location',
                                        {
                                            location: login.userId?.workingBranch || 'Unknown Location',
                                            username: login.userId?.username || login.username,
                                            designation: login.userId?.designation || 'No Designation',
                                            loginTime: login.loginTime
                                        }
                                    ])).values()].map((user, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{user.location}</h4>
                                                <span className="text-xs text-gray-500">📍</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-gray-700">{user.username}</p>
                                                <p className="text-xs text-gray-500">{user.designation}</p>
                                                <p className="text-xs text-blue-600">
                                                    Last login: {formatDate(user.loginTime)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">No location data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Logins */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Recent Login Activity</h3>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-500">Loading recent logins...</p>
                                    </div>
                                ) : analytics?.recentLogins?.length > 0 ? (
                                    analytics.recentLogins.map((login, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM5 8a2 2 0 11-4 0 2 2 0 014 0zM5 8a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {login.userId?.username || login.username}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {login.userId?.email || login.email}
                                                </p>
                                                <p className="text-xs text-blue-600 font-medium">
                                                    📍 {login.userId?.workingBranch || 'Unknown Location'}
                                                </p>
                                                {login.location?.city && login.location?.country && (
                                                    <p className="text-xs text-green-600">
                                                        🌍 {login.location.city}, {login.location.country}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-400">
                                                    👤 {login.userId?.designation || 'No Designation'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center">
                                                {getDeviceIcon(login.deviceType)}
                                                <span className="ml-1 text-xs text-gray-600 capitalize">{login.deviceType}</span>
                                            </div>
                                            <div className="flex items-center">
                                                {getOSIcon(login.deviceOS)}
                                                <span className="ml-1 text-xs text-gray-600 capitalize">{login.deviceOS}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{formatDate(login.loginTime)}</span>
                                        </div>
                                    </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">No recent login activity found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User History Modal */}
                        {selectedUser && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Login History for {selectedUser.username}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-600">
                                            This is a demo modal. In the real application, this would show the complete login history 
                                            for {selectedUser.username} including all devices, locations, and session durations.
                                        </p>
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <strong>Current Session:</strong>
                                                <p>Device: {selectedUser.deviceType}</p>
                                                <p>OS: {selectedUser.deviceOS}</p>
                                                <p>Browser: {selectedUser.browser}</p>
                                                <p>Login Time: {formatDate(selectedUser.loginTime)}</p>
                                            </div>
                                            <div>
                                                <strong>Sample History:</strong>
                                                <p>Previous login: 2 days ago</p>
                                                <p>Device: Desktop (Windows)</p>
                                                <p>Session Duration: 45 minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginAnalytics;
