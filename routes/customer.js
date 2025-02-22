const express = require('express')
const customerRouter = express.Router();
const { userAuth } = require('../middlewares/auth')
const Product = require("../models/product")


customerRouter.get("/wishlist", userAuth, async (req, res) => {
    try {
        const user = req.user;

        const wishlist = await Promise.all(
            user.wishlist.map(async (id) => {
                const product = await Product.findById(id);
                return {
                    id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0]
                }
            })
        )

        res.json({ data: wishlist })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

customerRouter.post("/wishlist/:productId", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const productId = req.params.productId;

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
        user.wishlist = user.wishlist.filter(id => id != productId);
        await user.save();
        res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = customerRouter