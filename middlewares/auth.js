const jwt = require("jsonwebtoken");
require('dotenv').config();
const Seller = require('../models/seller')
const User = require("../models/user")


const sellerAuth = async (req, res, next) => {
    try {
        const { sellerToken } = req.cookie;
        if (!sellerToken) {
            return res.status(401).send("Please login")
        }
        const decoded = await jwt.verify(sellerToken, process.env.SECRET_KEY)
        const seller = Seller.findById({ _id: decoded._id });

        if (!seller) {
            return res.status(401).send("User not found")
        }

        req.user = seller;
        next()

    } catch (error) {
        res.status(500).send("Internal Server Error")
    }
}

const customerAuth = async (req, res) => {
    try {
        const { userToken } = req.cookie;
        if (!userAuth) {
            return res.status(401).send("Please login")
        }
        const decoded = await jwt.verify(userToken, process.env.SECRET_KEY);
        const user = await User.findById({ _id: decoded._id });

        if(!user){
                res.status(401).send("User not found")
        }

        req.user = user;
        next();


    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
} 

module.exports = {userAuth, sellerAuth}