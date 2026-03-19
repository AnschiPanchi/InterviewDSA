import jwt from 'jsonwebtoken';

// Like verifyToken but doesn't fail if no token — just leaves req.userId undefined
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
        } catch (_) {
            // invalid token — proceed without userId
        }
    }
    next();
};

export default optionalAuth;
