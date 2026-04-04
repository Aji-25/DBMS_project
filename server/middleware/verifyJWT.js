import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
    // add temporarily to verifyJWT.js
    console.log('JWT_SECRET defined:', !!process.env.JWT_SECRET);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

export default verifyJWT;
