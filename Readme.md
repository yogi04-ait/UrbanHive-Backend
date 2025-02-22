# E-Commerce Clothing Website - Backend

## 📌 Project Overview

This is the backend for a full-stack e-commerce clothing website, built using **Node.js, Express.js, and MongoDB**. The project is currently in development, and features will be added progressively.

## 🏗️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Storage:** (To be decided, likely Cloudinary or AWS S3 for image uploads)

---

## 🚀 Features (In Development)

### ✅ User Features (Planned & In Progress)

- ✅ User **Signup/Login** (JWT Authentication)
- [ ] **Wishlist Management** (Add/Remove products)
- [ ] **Category-wise product browsing** (Men, Women, Kids, etc.)
- [ ] **Sort by price** (Lowest First, Highest First)
- [ ] **Saved Addresses** (Manage multiple delivery addresses)
- [ ] **Order Management** (Place and track orders)

### ✅ Seller Features (Planned & In Progress)

- [ ] **Product Management** (Add, Edit, Delete products)
- [ ] **Orders Received** (View & update order status)
- [ ] **Listed Products** (View seller’s added products)

---

## 📂 Folder Structure (Planned)

```
backend/
│── src/
│   ├── utils/   # Business logic (In progress)
│   ├── models/        # Mongoose Schemas (In progress)
│   ├── routes/        # API Endpoints (In progress)
│   ├── middlewares/   # Authentication & Validation (Planned)
│   ├── config/        # Database & Cloud Configs (Planned)
│── .env               # Environment variables (To be configured)
│── app.js          # Entry point (In progress)
```

---

## 📌 Database Schema (Current Plan)

### **Users Collection**

```json
{
  "_id": "ObjectId",
  "name": "Yogesh Aithani",
  "email": "yogesh@urbanhive.in",
  "password": "hashed_password",
  "wishlist": ["productId1", "productId2"],
  "addresses": ["addressId1", "addressId2"],
  "createdAt": "timestamp"
}
```

### **Seller Collection** (Separate Schema for Seller)

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

### **Orders Collection** (Separate Schema for Seller)

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "sellerId": "ObjectId",
  "products": [
    {
      "productId": "ObjectId",
      "quantity": 2
    }
  ],
  "status": "pending",
  "totalAmount": 1000,
  "createdAt": "timestamp"
}
```

### **Address Collection** (Separate Schema for Users)

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "fullName": "Yogesh Aithani",
  "phone": "+91XXXXXXXXXX",
  "pincode": "110023",
  "street": "123, ABC Road",
  "city": "New Delhi",
  "state": "Delhi",
  "isDefault": false,
  "createdAt": "timestamp"
}
```

---

## 🔧 Installation & Setup (Planned)

1. Clone the repository
   ```sh
   git clone https://github.com/yogi04-ait/UrbanHive-Backend.git
   cd UrbanHive-Backend
   ```
2. Install dependencies (To be updated as development progresses)
   ```sh
   npm install
   ```
3. Set up environment variables in `.env` (Not yet finalized)
   ```env
   PORT=5000
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_secret_key
   ```
4. Start the server (Once development reaches this stage)
   ```sh
   npm run dev
   ```

---

## 📌 Future Enhancements

✅ Payment Integration (Stripe/Razorpay) (Planned)  
✅ Review & Ratings System (Planned)  
✅ Admin Panel for User & Seller Management (Planned)

---

## 🚧 Development Status

This project is **under active development**, and the README will be updated as new features are implemented.

### 🚀 Happy Coding! Let me know if you need modifications!
