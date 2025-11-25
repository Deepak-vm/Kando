import jwt from 'jsonwebtoken'
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET)
}

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Unable to verify token'
        });
    }
};
