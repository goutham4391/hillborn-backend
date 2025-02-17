const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      // required: [true, "Phone number is required"],
      unique: true,
      match: [/^\d{10}$/, "Please provide a valid 10-digit phone number"], // Simple validation for 10-digit numbers
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      required: function () {
        return !this.googleId; // Password is required only if Google OAuth is not used
      },
    },
    googleId: {
      type: String, // For Google OAuth
      default: null,
    },
    roles: {
      type: String,
      enum: ["user", "admin"], // Restricts to "user" or "admin"
      default: "user", // Default role is "user"
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order", // Refers to the Order collection
      },
    ],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware to hash the password before saving if it's modified

// Create the User model
const User = mongoose.model("User", userSchema);

module.exports = User;
