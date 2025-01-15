import jwt from 'jsonwebtoken'
export const VerifyToken = async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log(token);

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.json({ message: 'Token is valid', user: decoded });
    });
};
//