const router = require("express").Router()
const User = require('../models/User')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config()

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 12)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        await newUser.save()
        res.status(200).json(newUser)
    }

    catch (error) {
        res.status(500).json(error)
    }
})






// login 
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(404).json('User not found');
        }
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!passwordMatch) {
            return res.status(401).json('Wrong password, please try again');
        }
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
        }, process.env.SEC_KEY,
            { expiresIn: '3d' });
        const { password, ...others } = user._doc

        res.status(200).json({ ...others, token });
    } catch (error) {
        res.status(500).json(error);
    }
});




module.exports = router;