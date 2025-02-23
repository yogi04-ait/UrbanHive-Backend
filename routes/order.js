const express = require('express');
const { userAuth, sellerAuth } = require('../middlewares/auth');
const mongoose = require('mongoose')
const Product = require('../models/product');
const Order = require('../models/order');
const orderRouter = express.Router();
const Address = require('../models/address')

// orderRouter.get("/status/:orderId",userAuth,async (req,res)=>{
//     try {


//     } catch (error) {
//         res.status(500).json({message:error.message})
//     }
// })

orderRouter.post("/order", userAuth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const user = req.user;
        const { orderItems, shippingAddress, isPaid, paymentMethod, status } = req.body;

        const address = await Address.findById(shippingAddress).session(session);
        if (!address) {
            await session.abortTransaction(); // Rollback
            session.endSession();
            return res.status(404).json({ message: "Address not found" });
        }
        let totalAmount = 0;

        const updatedOrderItems = [];
        for (let item of orderItems) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction(); // Rollback
                session.endSession();
                return res.status(404).json({ message: "Product not found" });
            }

            // Find the size object for the selected size
            const size = product.sizes.find(s => s.size === item.size)
            if (!size) {
                await session.abortTransaction(); // Rollback
                session.endSession();
                return res.status(404).json({ message: "Size not available" });
            }
            // check for stock
            if (size.quantity < item.quantity) {
                await session.abortTransaction(); // Rollback
                session.endSession();
                return res.status(400).json({ message: ` ${item.size} size not available for ${item.name}` });
            }
            const productPrice = product.price
            totalAmount += productPrice * item.quantity;

            updatedOrderItems.push({
                productId: item.productId,
                size: item.size,
                quantity: item.quantity,
                productPrice,
            });

            // update stock
            size.quantity -= item.quantity;
            await product.save({ session });
        }

        //create order
        const order = new Order({
            user: user._id,
            orderItems: updatedOrderItems,
            shippingAddress: address,
            totalAmount,
            isPaid,
            paymentMethod,
            status

        })

        await order.save({ session }); // Save order within transaction
        user.orders.push(order._id);
        await user.save({ session });
        await session.commitTransaction(); // Commit the transaction
        session.endSession();

        res.status(200).json({ message: "Order placed successfully", order: order })

    } catch (error) {
        await session.abortTransaction(); // Rollback on error
        session.endSession();
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
})

orderRouter.patch("/user/order/:orderId", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const { status } = req.body;
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.user.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized: You can only cancel your own orders" });

        }


        if (status !== "cancelled") {
            return res.status(400).json({ message: "Users can only cancel order" });
        }

        if (order.status === "delivered") {
            return res.status(400).json({ message: "Order is already delivered" });
        } else if (order.status === "cancelled") {
            return res.status(400).json({ message: "Order is already cancelled" });
        }

        order.status = status;
        await order.save();
        res.status(200).json({ message: "Order status updated successfully", order: order });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
})

orderRouter.patch("/seller/order/:orderId", sellerAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status === "delivered") {
            return res.status(400).json({ message: "Order is already delivered" });
        }

        if (order.status === status) {
            return res.status(400).json({ message: "Order is already in this status" });
        }

        if (!["shipped", "delivered", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({ message: "Cannot update a cancelled order" });
        }



        order.status = status;
        await order.save();
        res.status(200).json({ message: `Order status updated to ${status} successfully`, order })

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
})

module.exports = orderRouter