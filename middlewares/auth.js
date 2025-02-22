const jwt = require("jsonwebtoken");
require('dotenv').config();
const Seller = require('../models/seller')
const User = require("../models/user")


const sellerAuth = async (req, res, next) => {
    try {
        const { sellerToken } = req.cookies;
        if (!sellerToken) {
            return res.status(401).send("Please login")
        }
        const decoded = jwt.verify(sellerToken, process.env.SECRET_KEY)
        const seller = await Seller.findById(decoded._id);

        if (!seller) {
            return res.status(401).json({ message: "Seller not found" });
        }

        req.user = seller;
        next()

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

const userAuth = async (req, res, next) => {
    try {
        const { userToken } = req.cookies;
        if (!userToken) {
            return res.status(401).json({ message: "Please login" });
        }
        const decoded = jwt.verify(userToken, process.env.SECRET_KEY);
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();


    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}

module.exports = { userAuth, sellerAuth };

