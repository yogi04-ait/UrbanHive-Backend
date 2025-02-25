# 🛍️ E-Commerce Clothing Platform - Backend

## 📌 Project Overview

This is the backend for a **multi-seller e-commerce clothing platform**, built using **Node.js, Express.js, and MongoDB**. The platform allows multiple sellers to register, list their products, and manage their orders while users can browse, purchase, and track orders from multiple sellers at once.

## 🏗️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Storage:** (To be integrated, likely Cloudinary or AWS S3 for product images)

---

## 🚀 Features

### ✅ User Features

- **User Signup/Login** (JWT Authentication)
- **Wishlist Management** (Add/Remove products)
- **Category-wise product browsing** (Men, Women, Kids, etc.)
- **Sort by price** (Lowest First, Highest First)
- **Saved Addresses** (Manage multiple delivery addresses)
- **Order Management** (Place and track orders)
- **Place orders from multiple sellers at a time**

### ✅ Seller Features

- **Product Management** (Add, Edit, Delete products)
- **Orders Received** (View & update order status for their products)
- **Listed Products** (View seller’s added products)
- **Delete a listed product** (Deleted products are no longer available for new orders but remain in existing order records)

---

## 📂 Folder Structure

```
backend/
│── src/
│   ├── utils/         # Utility functions
│   ├── models/        # Mongoose Schemas
│   ├── routes/        # API Endpoints
│   ├── middlewares/   # Authentication & Validation
│   ├── config/        # Database & Cloud Configs
│── .env               # Environment variables
│── app.js             # Entry point
```

---

## 📌 Database Schema

### **Users Collection**

```json
{
  "_id": "ObjectId",
  "name": "Yogesh Aithani",
  "email": "yogesh@example.com",
  "password": "hashed_password",
  "wishlist": ["productId1", "productId2"],
  "addresses": ["addressId1", "addressId2"],
  "createdAt": "timestamp"
}
```

### **Sellers Collection**

```json
{
  "_id": "ObjectId",
  "name": "Seller Name",
  "email": "seller@example.com",
  "password": "hashed_password",
  "products": ["productId1", "productId2"],
  "orders": ["orderId1", "orderId2"],
  "createdAt": "timestamp"
}
```

### **Orders Collection** (References multiple sellers via `OrderItem`)

```json
{
  "_id": "ObjectId",
  "user": "ObjectId",
  "shippingAddress": {
    "name": "User Name",
    "mobileNumber": "XXXXXXXXXX",
    "pincode": "110023",
    "city": "New Delhi",
    "state": "Delhi"
  },
  "orderItems": ["orderItemId1", "orderItemId2"],
  "paymentMethod": "COD",
  "isPaid": false,
  "status": "pending",
  "totalAmount": 1000,
  "createdAt": "timestamp"
}
```

### **Order Items Collection** (Linked to specific sellers)

```json
{
  "_id": "ObjectId",
  "order": "ObjectId",
  "product": "ObjectId",
  "seller": "ObjectId",
  "quantity": 2,
  "size": "M",
  "productPrice": 500,
  "total": 1000,
  "status": "pending",
  "createdAt": "timestamp"
}
```

---

## 🔧 Installation & Setup

1. Clone the repository
   ```sh
   git clone https://github.com/yogi04-ait/UrbanHive-Backend.git
   cd UrbanHive-Backend
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Set up environment variables in `.env`
   ```env
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the server
   ```sh
   npm run dev
   ```

---

## 📌 Future Enhancements

✅ **Online Payment Integration** (Razorpay integration planned)  
✅ **Email Notifications** (Users & sellers will receive order updates via email)  
✅ **Review & Ratings System** (Allow users to review products)  
✅ **Admin Panel** (For user & seller management)

---

## 🚧 Development Status

The project is **actively being developed**, with continuous improvements and new features being added. Stay tuned for more updates!

### 🚀 Happy Coding!
