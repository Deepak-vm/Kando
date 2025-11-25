import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Access token required',
                message: 'Token is missing'
            });
        }

        const decoded = verifyToken(token);
        req.user = decoded.userId;
        next();

    } catch (error) {
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Unable to verify token'
        });
    }
};
