const express = require('express');
const productRouter = express.Router();
const Product = require('../models/product')
const mongoose = require('mongoose')
const {sellerAuth} = require("../middlewares/auth")


productRouter.get("/products", async (req, res) => {
    try {
        const { category, subCategory, sort, page = 1, limit = 15 } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        let filter = {}
        if (category) {
            filter.category = category
        }
        if (subCategory) {
            filter.subCategory = subCategory;
        }
        let sortOrder = {}
        if (sort) {
            if (sort === "price_asc") {
                sortOrder.price = 1;
            } else if (sort === 'price_desc') {
                sortOrder.price = -1;
            }
        }

        const skip = (pageNumber - 1) * limitNumber
        const products = await Product.find({...filter,isDeleted:false})
            .sort(sortOrder)
            .skip(skip)
            .limit(limitNumber)
            .select("_id name price images")


        const totalItems = await Product.countDocuments(filter);

        res.status(200).json({
            data: products,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                totalItems: totalItems,
                totalPages: Math.ceil(totalItems / limitNumber)
            }
        })


    } catch (error) {
        res.status(500).json({ message: error.message })
    }

})

productRouter.get("/product/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(id)

        if (!product) {
           return res.status(404).json({ message: "Item not found" })
        }
        if(product.isDeleted){
            return res.status(404).json({message:"product is deleted by seller"})
        }

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

productRouter.delete("/product/:id", sellerAuth, async (req,res)=>{
    try {
        const seller = req.user;
        const id = req.params.id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        const product = await Product.findById(id)

        // check product available or not
        if(!product){
            return res.status(404).json({message:"Item not found" })
        }

        // check if user listed this product or not
        if(product.seller.toString() !== seller._id){
            return res.status(403).json({message:"You are not the seller of this product"})
        }

        // check if product is deleted or not
        if(product.isDeleted){
            return res.status(404).json({message:"product is deleted by seller"})
        }

        product.isDeleted = true;
        await product.save()
        res.status(200).json({message:"product deleted successfully"})
        
    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

module.exports = productRouter