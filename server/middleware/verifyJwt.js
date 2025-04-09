const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyJwt(req, res, next) {
    
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token' });
    }

    let decoded;
    let user;

    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user.id = user._id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token or user' });
    }
}

module.exports = verifyJwt;