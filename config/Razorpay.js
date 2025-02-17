const Razorpay = require('razorpay');
const crypto = require('crypto');

const RAZORPAY_KEY_ID = 'your_razorpay_key_id';
const RAZORPAY_KEY_SECRET = 'your_razorpay_key_secret';

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

async function initiateRazorpayPayment(orderId, amount, userId, mobileNumber) {
  try {
    const options = {
      amount: amount * 100, // Convert to paisa
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      payment_capture: 1, // Auto capture payment
    };
    
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    throw error;
  }
}

async function verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
  try {
    const generated_signature = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      return { status: 'success', message: 'Payment verified successfully' };
    } else {
      throw new Error('Invalid payment signature');
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
}

module.exports = { initiateRazorpayPayment, verifyRazorpayPayment };
