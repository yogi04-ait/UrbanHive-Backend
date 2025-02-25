const mongoose = require('mongoose');
const User = require('./user')
const Product = require('./product')
const Address = require('./address')
const Seller = require('./seller')
const OrderItem = require('./orderItem')


const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    shippingAddress: {
        name: String,
        mobileNumber: String,
        pincode: String,
        line1: String,
        line2: String,
        landmark: String,
        city: String,
        state: String
    },
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "OrderItem",
        }
    ],
    paymentMethod: {
        type: String,
        enum: ["online", "COD"]
    },
    isPaid: Boolean,
    status: {
        type: String,
        enum: ["pending", "shipped", "delivered", "cancelled"],
        default: "pending",
        index: true
    },
    totalAmount: {
        type: Number,
        required: true
    }

}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema)
module.exports = Order;