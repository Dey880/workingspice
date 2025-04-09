const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyJwt(req, res, next) {
    console.log('Cookies received:', req.cookies);
    console.log('JWT cookie:', req.cookies.jwt);
    
    const token = req.cookies.jwt;

    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: 'Unauthorized: No token' });
    }

    let decoded;
    let user;

    try {
        decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        user = await User.findOne({ email: decoded.email });

        if (!user) {
            console.log('User not found:', decoded.email);
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        req.user.id = user._id;
        next();
    } catch (error) {
        console.log('Error verifying token or finding user:', error);
        console.log('Token:', token);
        console.log('Decoded:', decoded);
        console.log('User:', user);

        return res.status(401).json({ message: 'Unauthorized: Invalid token or user' });
    }
}

module.exports = verifyJwt;