import jwt from 'jsonwebtoken';

export const MiddilWare = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from header
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.admin = decoded; // Attach user info to the request object
        console.log(token);

        next(); // Pass control to the next middleware/handler
    } catch (err) {
        console.error(err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};
