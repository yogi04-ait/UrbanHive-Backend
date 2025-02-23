const express = require('express')
const authRouter = express.Router()
const User = require("../models/user")
const Seller = require("../models/seller")
const { validateSignupData } = require("../utils/validator")
const bcrypt = require('bcrypt')

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignupData(req)
        const { name, email, password } = req.body;
        //Encrypting password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        const savedUser = await user.save();
        const { password: _, ...userWithoutPassword } = savedUser.toObject();
        const token = savedUser.getJWT();
        res.cookie("userToken", token);
        res.status(201).json({ message: "User registered successfully", data: userWithoutPassword });

    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message })
    }
})

authRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("Invalid Credentials")
        }
        const isValidPassword = await user.validatePassword(password)
        if (!isValidPassword) {
            throw new Error("Invalid Credentials")
        }

        const token = user.getJWT();
        res.cookie("userToken", token);
        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ message: "User logged in successfully", data: userWithoutPassword });

    } catch (err) {
        console.error("Error during signup:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
})

authRouter.post("/logout", async (req, res) => {
    res.cookie("userToken", null, {
        expires: new Date(0),
    });
    res.send("Logout Successful!!");
});

authRouter.post("/seller/signup", async (req, res) => {
    try {
        validateSignupData(req, true);
        const { name, email, password, shopName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const seller = new Seller({ name, email, password: hashedPassword, shopName });
        const savedSeller = await seller.save();
        const { password: _, ...sellerWithoutPassword } = savedSeller.toObject();
        const token = savedSeller.getJWT();
        res.cookie("sellerToken", token)
        res.status(201).json({ message: "Seller registered successfully", data: sellerWithoutPassword });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: err.message })

    }
})

authRouter.post("/seller/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Seller.findOne({ email });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            throw new Error("Invalid Credentials");
        }
        const token = user.getJWT();
        const { password: _, ...sellerWithoutPassword } = user.toObject();
        res.cookie("sellerToken", token);
        res.status(200).json({ message: "Logged in successfully", data: sellerWithoutPassword })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
})

authRouter.post("/seller/logout", async (req, res) => {
    res.cookie("sellerToken", null, {
        expires: new Date(0),
    });
    res.send("Logout Successful!!");
});

module.exports = authRouter;