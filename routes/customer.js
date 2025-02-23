const express = require('express')
const customerRouter = express.Router();
const mongoose = require('mongoose')
const { userAuth } = require('../middlewares/auth')
const { validateAddress } = require("../utils/validator")
const Product = require("../models/product");
const Address = require("../models/address");
const User = require('../models/user');
const bcrypt = require('bcrypt')
const {validateSignupData} =  require("../utils/validator.js")

customerRouter.patch("/edit/profile", userAuth, async (req,res)=>{
    try {
        const user = req.user;
        let updatedUser;
        const {name, email, oldPassword, newPassword} = req.body;
        if(newPassword){
            const isValidPassword = await user.validatePassword(oldPassword);
            validateSignupData({name,email,password:newPassword});
            if(isValidPassword){
                 const hashedPassword = await bcrypt.hash(newPassword,10);
                 updatedUser = await User.findByIdAndUpdate(user._id,{name,email,password:hashedPassword},{new:true})

            }else{
                res.status(401).json({message:"Incorrect old password"})
            }
        }else{
            validateSignupData({name,email});
            updatedUser = await User.findByIdAndUpdate(user._id,{name,email},{new:true});
        }
        const { password: _, ...userWithoutPassword } =  updatedUser.toObject();
        
        res.status(200).json({ message: "profile updated successfully" ,user:userWithoutPassword})

    } catch (error) {
        res.status(500).json({message:error.message})
    }
})
customerRouter.get("/wishlist", userAuth, async (req, res) => {
    try {
        const user = req.user;

        const populatedUser = await User.findById(user._id).populate("wishlist")

        const wishlist = populatedUser.wishlist.map(product => ({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.images[0]
        }))

        res.json({ data: wishlist })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

customerRouter.post("/wishlist/:productId", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
            res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist })
        } else {
            res.status(400).json({ message: "Product already in wishlist" })
        }

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})



customerRouter.delete("/wishlist/:productId", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const productId = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        user.wishlist = user.wishlist.filter(id => id != productId);
        await user.save();
        res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

customerRouter.post("/address", userAuth, async (req, res) => {
    try {
        const user = req.user;
        validateAddress(req.body)
        const address = new Address({ user: user._id, ...req.body })
        await address.save();
        user.address.push(address._id);
        await user.save();
        res.status(200).json({ message: "Address added successfully", address: address })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

customerRouter.patch("/address/:id", userAuth, async (req, res) => {
    try {
        const user = req.user;
        validateAddress(req.body)
        const { id } = req.params;
        const address = await Address.findById(id);

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (address.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this address" });
        }

        const updatedAddress = await Address.findByIdAndUpdate(id, { ...req.body, user: address.user }, { new: true })

        res.status(200).json({ message: "Address added successfully", address: updatedAddress })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

customerRouter.delete("/address/:id", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const address = await Address.findById(id);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }
        if (address.user.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this address" });
        }
        await Address.findByIdAndDelete(id)
        res.status(200).json({ message: "Address deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})



module.exports = customerRouter