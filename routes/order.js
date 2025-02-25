const express = require('express');
const mongoose = require('mongoose');
const orderRouter = express.Router();
const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Product = require('../models/product');
const { userAuth, sellerAuth } = require('../middlewares/auth');
const Address = require('../models/address');
const Seller = require('../models/seller');

orderRouter.post("/order", userAuth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = req.user;
        const { orderItems, addressId, paymentMethod, isPaid } = req.body;

        // Verify Address 
        const address = await Address.findById(addressId).session(session);
        if (!address) {
            throw new Error("Address not found");
        }
        const { user:_, _id, ...addressDetails } = address.toObject();

        let totalAmount = 0;
        const orderItemIds = [];
        const sellerOrderMap = {}; // Store seller orders separately

        // Create Order (Empty initially)
        const newOrder = new Order({
            user: user._id,
            shippingAddress: addressDetails,
            orderItems: [],
            paymentMethod,
            isPaid,
            status: "pending",
            totalAmount: 0
        });

        await newOrder.save({ session });

        // Process Order Items
        for (const item of orderItems) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                throw new Error(`Product ${item.product} not found`);
            }

            if(product.isDeleted){
                throw new Error(`${product.name} is deleted`);
            }

            // Verify size availability
            const selectedSize = product.sizes.find(s => s.size === item.size);
            if (!selectedSize || selectedSize.quantity < item.quantity) {
                throw new Error(`Not enough stock for ${product.name} (Size: ${item.size})`);
            }

            // Update stock
            selectedSize.quantity -= item.quantity;
            await product.save({ session });

            const total = item.quantity * product.price;
            totalAmount += total;

            // Create OrderItem
            const newOrderItem = new OrderItem({
                order: newOrder._id,
                product: product._id,
                seller: product.seller,
                size: item.size,
                quantity: item.quantity,
                productPrice: product.price,
                total,
                status: "pending"
            });

            await newOrderItem.save({ session });
            orderItemIds.push(newOrderItem._id);

            // Store seller order items in a map
            if (!sellerOrderMap[product.seller]) {
                sellerOrderMap[product.seller] = [];
            }
            sellerOrderMap[product.seller].push(newOrderItem._id);
        }

        // Update Order with OrderItems and Total Amount
        newOrder.orderItems = orderItemIds;
        newOrder.totalAmount = totalAmount;
        await newOrder.save({ session });

        user.orders.push(newOrder._id);
        await user.save({ session });

        //  Update Seller Orders in One Batch
        const sellerUpdates = Object.keys(sellerOrderMap).map(sellerId =>
            Seller.findByIdAndUpdate(sellerId, {
                $push: { orders: { $each: sellerOrderMap[sellerId] } }
            }, { session })
        );

        await Promise.all(sellerUpdates);

        // Commit the Transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({ message: "Order placed successfully", order: newOrder });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: error.message });
    }
});


orderRouter.get("/user/orders", userAuth, async (req,res)=>{
    try {
        const user = req.user;
        const {page=1, limit=10} = req.query;

        const orders = await Order.find({ user: user._id })
                        .select("order._id shippingAddress totalAmount paymentMethod status createdAt ")
                        .sort({createdAt:-1})
                        .limit(limit*1)
                        .skip((page-1)*limit)
                        .populate({
                            path:"orderItems",
                            select: "quantity size  total status",
                            populate:{
                                path:"product",
                                select: "name images price"
                            }
                        })

        res.status(200).json({orders });

    } catch (error) {
        res.status(500).json({message:error.message})
    }
})

orderRouter.get("/user/cancel", userAuth, async (req,res)=>{
    try {
        const user = req.user;
        const {orderId, itemIds, cancelAll = false} = req.query;
        
        const order = await Order.findById(orderId);
        if(!order){
            return res.send(404).json({message:"Order not found"})
        }
        if (order.user.toString() !== user._id.toString()){
            return res.send(401).json({message:"You're not authorized to cancel this order"})
        }

        if (order.status === "delivered") {
            return res.status(400).json({ message: "You cannot cancel a delivered order." });
        }
        if (order.status === "cancelled") {
            return res.status(400).json({ message: "This order has already been cancelled." });
        }

        let itemsToCancel = [];


        if (cancelAll === "true") {
            itemsToCancel = order.orderItems;
        } else {
            if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
                return res.status(400).json({ message: "Invalid itemIds" });
            }
            itemsToCancel = itemIds;
        }

        const existingItems = await OrderItem.find({_id:{$in:itemsToCancel}});

        const nonCancellableItems = existingItems.filter(item=>{
                item.status === "delivered" || item.status === "cancelled"
        }
        );

        if(nonCancellableItems.length > 0){
            return res.status(400).json({
                message: "Some items cannot be cancelled as they are already delivered or cancelled.",
                nonCancellableItems
            });
        }

        await OrderItem.updateMany(
            { _id: { $in: itemsToCancel } },
            { $set: { status: "cancelled" } }
        );

        const remainingItems = await OrderItem.countDocuments({
            order: orderId,
            status: { $ne: "cancelled" }
        });

        if (remainingItems === 0) {
            order.status = "cancelled";
        }

        await order.save();
        return res.status(200).json({ message: "Order cancelled successfully" });
    

    } catch (error) {
        res.status(500).send({message:error.message})
    }
} )

orderRouter.patch("/seller/update-status", sellerAuth, async (req, res) => {
    try {
        const seller = req.user;
        const { itemId, status } = req.body;

        // Validate request
        if (!itemId ) {
            return res.status(400).json({ message: "Invalid itemId" });
        }
        if (!["shipped", "delivered", "cancelled"].includes(status)) {
            return res.status(400).json({ message: "Invalid status update" });
        }

        // Find order that belong to this seller
        const order = await OrderItem.findById(itemId);


        if (!order) {
            return res.status(404).json({ message: "No matching order found" });
        }

        if(order.seller.toString() !== seller._id.toString()){
            return res.status(403).json({message:"Unauthorized: This order does not belong to you"})
        }

        if(order.status == status){
            return res.status(400).json({ message: "Order status is already updated" });
        }

        // Check if order already cancelled or delivered
        if (order.status === 'cancelled' || order.status === 'delivered'){
            return res.status(400).json({ message: `Order is already marked as ${status}` });
        }

        // Update order status
        order.status = status;
        await order.save();
        return res.status(200).json({ message: `Order updated to ${status} successfully` });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = orderRouter;