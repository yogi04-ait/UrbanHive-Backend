const mongoose = require('mongoose')
const User = require('./user')
const Product = require('./product')
const Address = require('./address')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount must be positive']
    },
    isPaid: {
        type: Boolean,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ["online", "COD"],
        required: true,
    },

    subOrders: [
        {
            seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
            orderItems:[
                {
                productId:{type:mongoose.Schema.Types.ObjectId, ref:"Product", required:true},
                quantity:{type:Number,required:true},
                productPrice:{type:Number,required:true},
            }       
            ],
            status:{
                type:String,
                enum:["pending","shipped","delivered","cancelled"],
                required:true,
            },
            totalAmount:{
                type:Number,
                required:true
            }
            
        }
    ]

}, { timestamps: true })

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;