const mongoose = require('mongoose')
const Order = require("./order")
const Seller = require("./seller")

const orderItemSchema = new mongoose.Schema(

    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: true,
            index: true,
        },
        quantity: {
            type: Number,
            required: true

        },
        size: {
            type: String,
            enum: ['S', 'M', 'L', 'XL'],
            required: true,
        },
        productPrice: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "shipped", "delivered", "cancelled"],
            default: "pending",
            index: true,
        },
    }, { timestamps: true }

)

const OrderItem = new mongoose.model("OrderItem", orderItemSchema);
module.exports = OrderItem