const { verifyTokenAndAuthorizaion, verifyTokenAndAdmin } = require("./verifyToken")
const User = require('../models/User')
const router = require("express").Router()
const bcrypt = require('bcrypt');



router.put("/:id", verifyTokenAndAuthorizaion, async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: 'Request body is empty' });
        }
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 12);
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id,
            {
                $set: req.body
            },
            {
                new: true
            });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' }); // id is uncorrect
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.delete("/:id", verifyTokenAndAuthorizaion, async (req, res) => {
    try {

        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // id is uncorrect
        }

        res.status(200).json("user deleted ");
    } catch (error) {
        console.error("Error deleted user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get user 
router.get("/find/:id", verifyTokenAndAuthorizaion, async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' }); // id is uncorrect
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// get all user 
router.get("/admin", verifyTokenAndAdmin, async (req, res) => {
    const { new: queryNew } = req.query;
    try {
        let users;
        if (queryNew) {
            //  'new'  
            users = await User.find().sort({ _id: -1 }).limit(5);
        } else {
            users = await User.find();
        }

        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error("Error getting all users:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// get users stats
router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    try {
        const stats = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" },
                }
            },
            { $group: { _id: '$month', total: { $sum: 1 } } }
        ]);

        if (!stats || stats.length === 0) {
            return res.status(404).json({ error: 'Statistics not found' });
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching statistics:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router