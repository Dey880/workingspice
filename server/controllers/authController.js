const User = require('../models/User');
const argon2 = require('argon2');
const createJwt = require('../utils/createJwt');
const createCookie = require('../utils/createCookie');
const Settings = require('../models/Settings');

const authController = {
    register: async (req, res) => {
        const { email, password, repeatPassword, username } = req.body;
        try {
            // Check if public registration is allowed
            const settings = await Settings.getSettings();
            if (!settings.allowPublicRegistration) {
                return res.status(403).json({ msg: "Public registration is currently disabled" });
            }
            
            const role = 'user';
            const emailLowercase = email.toLowerCase();
            
            if (password === repeatPassword) {
                try {
                    const hash = await argon2.hash(password);
                    const user = new User({
                        email: emailLowercase,
                        username,
                        password: hash,
                        role,
                    });
                    await user.save();
                    const jwtToken = createJwt(emailLowercase, role);
                    await createCookie(res, jwtToken);
                    res.status(200).json({msg: "Successfully created user", user});
                } catch (err) {
                    console.error(err);
                    res.status(500).json({msg: "Error creating user"});
                }
            } else {
                res.status(400).json({msg: "Passwords do not match"});
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({msg: "Internal server error"});
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const emailLowercase = email.toLowerCase();
            
            const user = await User.findOne({ email: emailLowercase });
            if (!user) {
                return res.status(401).json({msg: "Invalid credentials"});
            }
            const role = user.role;
            let hashedPassword = user.password;
            const isValid = await argon2.verify(hashedPassword, password);
            if (isValid) {
                const jwtToken = createJwt(emailLowercase, role);
                await createCookie(res, jwtToken);
                res.status(200).json({msg: "Successfully logged in", user});
            } else {
                res.status(401).json({msg: "Invalid credentials"});
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({msg: "Internal server error"});
        }
    },
    logout: async (req, res) => {
        try {
            res.cookie('jwt', '', {
                httpOnly: true,
                expires: new Date(0),
            });
            res.status(200).json({ msg: "Successfully logged out" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Internal server error" });
        }
    },
    user: async (req, res) => {
        let email = req.user.email;
        try {
            const user = await User.findOne({email});
            if (user) {
                res.status(200).send({ msg: "User found", user });
            } else {
                res.status(404).send({ msg: "User not found" });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: "Bad Request", err });
        }
    },
    getAllAdmins: async (req, res) => {
        try {
            // Only allow admins to access this endpoint
            if (req.user.role !== 'admin') {
                return res.status(403).json({ msg: "Not authorized" });
            }
            
            const admins = await User.find({ role: 'admin' }).select('_id username email');
            res.status(200).json({ admins });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: "Internal server error" });
        }
    }
};

module.exports = authController;