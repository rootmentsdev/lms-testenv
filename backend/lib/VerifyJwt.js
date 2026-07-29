import jwt from 'jsonwebtoken'
export const VerifyToken = async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log(token);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        
        try {
            // Import Admin model to fetch latest branches
            const Admin = (await import('../model/Admin.js')).default;
            const adminUser = await Admin.findById(decoded.userId).populate('branches');
            
            res.json({ 
                message: 'Token is valid', 
                user: { 
                    ...decoded, 
                    branches: adminUser?.branches || [] 
                } 
            });
        } catch (error) {
            console.error('Error fetching admin details during token verification:', error);
            // Fallback to just decoded data if DB fetch fails
            res.json({ message: 'Token is valid', user: decoded });
        }
    });
};
//