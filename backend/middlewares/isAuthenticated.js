import jwt from 'jsonwebtoken';

const isAuthenticated = (req, res, next) => {
    try {
        // Check if token exists in cookies
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'User not authenticated', success: false });
        }

        // Decode the token to extract user information
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        
        // Add userId to the request object for use in subsequent middleware/controller
        req.id = decode.userId;

        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        // Handle errors, such as invalid token or expired token
        console.error("Authentication error:", error);
        res.status(401).json({ message: 'Invalid or expired token', success: false });
    }
};

export default isAuthenticated;
