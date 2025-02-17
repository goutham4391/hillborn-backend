const { initiatePhonePePayment, verifyPhonePePayment } = require("../config/Phonepe");
const verifyToken = require("../middleware/authmiddleware");
const Order = require("../models/Order");
const User = require("../models/User");
const router = require("express").Router();


// Create Order & Initiate Payment
router.post('/create',verifyToken(['user','admin']), async (req, res) => {
  try {
    const { templateId, amount } = req.body;
    const userId = req.user.id;
    const phone = req.user.phone;
    console.log("user",userId);
    
    // Check if user exists
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(400).json({ message: "User not found" });
    // }

    // Create order
    const order = new Order({ userId, templateId, amount, status: 'pending' });
    await order.save();

    // Store order in user's profile
   
    // await user.save();

    // Initiate PhonePe Payment
    const paymentResponse = await initiatePhonePePayment(order._id, amount, userId, phone);
    // console.log(paymentResponse);
console.log("paymentsresponse",paymentResponse);
    // res.redirect(`${process.env.FRONTENDURL}/success`);
    
    res.status(201).json({ success: true, order, paymentResponse });
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ success: false, message: 'Error creating order', error });
  }
});

// Verify Payment
// Verify Payment
// // Verify Payment
router.post('/verify',verifyToken(['user','admin']), async (req, res) => {
  try {
    // Extract orderId and transactionId from the session or database
    // console.log("enter")
    
    const user = req.user; 
    console.log("user",user);
     // Assuming you're using session-based authentication
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Retrieve the latest order (or from where the orderId is stored)
    const order = await Order.findOne({ userId: user.id, status: 'pending' }).sort({ createdAt: -1 });
    console.log("order",order);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // const transactionId = order._id;  // Assuming you have stored transactionId on the order

    // Now, verify the payment using the PhonePe API
    const verificationResponse = await verifyPhonePePayment(order._id);
    if (verificationResponse && verificationResponse.success) {
      // Update order status to 'completed'
      order.status = 'completed';
      await order.save();

      // Optional: Update user's orders
      const userProfile = await User.findById(user.id);
      console.log(userProfile);
      
      if (!userProfile.orders.includes(order.templateId)) {
        userProfile.orders.push(order.templateId);
        await userProfile.save();
      }
      return res.status(200).json({ success: true, message: 'Payment verified successfully', redirectUrl: `${process.env.FRONTENDURL}/success` });
      // return res.redirect(`${process.env.FRONTENDURL}/`);
      // return res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error verifying payment', error });
  }
});

  
module.exports = router;
