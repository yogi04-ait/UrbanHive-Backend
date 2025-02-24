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
        const { orderItems, shippingAddress, isPaid, paymentMethod } = req.body;

        const address = await Address.findById(shippingAddress).session(session);
        if (!address) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Address not found" });
        }

        let totalAmount = 0;
        const sellerOrders = new Map(); // To group items by seller

        for (let item of orderItems) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: `Product not found` });
            }

            const size = product.sizes.find(s => s.size === item.size);
            if (!size || size.quantity < item.quantity) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Stock not available for ${item.size} of ${product.name}` });
            }

            // Deduct stock inside transaction
            size.quantity -= item.quantity;
            await product.save({ session });

            // Group items by seller
            if (!sellerOrders.has(product.seller.toString())) {
                sellerOrders.set(product.seller.toString(), {
                    seller: product.seller,
                    orderItems: [],
                    totalAmount: 0,
                    status: "pending",
                });
            }

            const sellerOrder = sellerOrders.get(product.seller.toString());
            sellerOrder.orderItems.push({
                productId: item.productId,
                size: item.size,
                quantity: item.quantity,
                productPrice: product.price,
            });
            sellerOrder.totalAmount += product.price * item.quantity;

            totalAmount += product.price * item.quantity;
        }

        // Convert sellerOrders map to array
        const subOrders = Array.from(sellerOrders.values());

        // Create order with grouped sub-orders
        const order = new Order({
            user: user._id,
            shippingAddress: address,
            totalAmount,
            isPaid,
            paymentMethod,
            subOrders,
        });

        await order.save({ session });
        user.orders.push(order._id);
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: "Order placed successfully", order });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

orderRouter.get("/user/orders", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const orders = await Order.find({ user: user._id }).populate("subOrders.seller", "name email");

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found" });
        }

        res.status(200).json({ message: "User orders fetched successfully", orders });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

orderRouter.get("/seller/orders", sellerAuth, async (req, res) => {
    try {
        const seller = req.user;
        const orders = await Order.find({ "subOrders.seller": seller._id })
            .populate("user", "name email")
            .populate("subOrders.orderItems")

        if (!orders.length) {
            return res.status(404).json({ message: "No orders found for this seller" });
        }

        // Filter only the relevant subOrders for this seller
        const sellerOrders = orders.map(order => ({
            _id: order._id,
            user: order.user,
            createdAt: order.createdAt,
            subOrders: order.subOrders.filter(sub => sub.seller.toString() === seller._id.toString()),
        }));

        res.status(200).json({ message: "Seller orders fetched successfully", orders: sellerOrders });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});





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