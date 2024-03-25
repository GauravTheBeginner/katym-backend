const { Router } = require("express");
const zod = require('zod');
const router = Router();
const jwt = require('jsonwebtoken')
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = require("../middleware");
const { Account, User } = require("../db/db");

const SignupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})

const SigninBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.post('/Signup', async (req, res) => {
    const { success } = SignupBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        username: req.body.username
    })

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken/Incorrect inputs"
        })
    }
    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })
    const userId = user._id;

    await Account.create({
        userId,
        balance: Math.floor( Math.random() * 100000),
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token,
        userId: userId,
    })
})


router.post('/Signin', async (req, res) => {

    const { success } = SigninBody.safeParse(req.body);

    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });


    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token,
            userId: user._id
        })
        return;
    }


    res.status(411).json({
        message: "Error while logging in"
    })
})

router.put("/update", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            message: "Error while updating information"
        });
    }
    try {
        const userId = req.userId;
        await User.updateOne({ _id: userId },  { $set: req.body } );
        return res.json({
            message: "Updated successfully",
            userId: userId
        });
    } catch (error) {
        console.error("Error updating user information:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
});


router.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })

})

module.exports = router;