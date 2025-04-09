const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyJwt(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        req.user.id = user._id;
        next();
    } catch (error) {
        console.log(user);
        console.log(token);
        console.log(decoded);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}
module.exports = verifyJwt;