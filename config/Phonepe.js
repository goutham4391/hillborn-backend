const axios = require('axios');
const crypto = require('crypto');

const PHONEPE_MERCHANT_ID = 'M2246RE4CGDAL';
const PHONEPE_SALT_KEY = 'c5b68207-8051-4736-aa42-c9ec01e5e47c';
const PHONEPE_SALT_INDEX = '1';
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/hermes';

async function initiatePhonePePayment(orderId, amount, userId, mobileNumber) {
  try {
    // const transactionId = `T${orderId}${Date.now().toString().slice(-6)}`;
    const payload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: orderId,
      merchantUserId: userId,
      amount: amount * 100, // Convert to paisa
      redirectUrl: `${process.env.FRONTENDURL}/sucess`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.FRONTENDURL}/`,
      mobileNumber: mobileNumber,
      paymentInstrument: { type: 'PAY_PAGE' }
    };
    
    const payloadString = JSON.stringify(payload);
    const apiEndpoint = '/pg/v1/pay';
    const checksum = crypto.createHash('sha256')
    .update(Buffer.from(payloadString).toString('base64') + apiEndpoint + PHONEPE_SALT_KEY)
    .digest('hex') + `###${PHONEPE_SALT_INDEX}`;
  
    const response = await axios.post(`${PHONEPE_BASE_URL}${apiEndpoint}`, 
      { request: Buffer.from(payloadString).toString('base64') }, 
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum } }
    );
    console.log(response.data);
    
    
    return response.data;
  } catch (error) {
    console.error('Error initiating PhonePe payment:', error?.response?.data);
    throw error;
  }
}

async function verifyPhonePePayment(transactionId) {
  try {
    const apiEndpoint = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${transactionId}`;
    const checksum = crypto.createHash('sha256')
      .update(apiEndpoint + PHONEPE_SALT_KEY)
      .digest('hex') + `###${PHONEPE_SALT_INDEX}`;

    const response = await axios.get(`${PHONEPE_BASE_URL}${apiEndpoint}`, {
      headers: { 'X-VERIFY': checksum }
    });

    return response.data;
  } catch (error) {
    console.error('Error verifying PhonePe payment:', error?.response?.data);
    throw error;
  }
}

module.exports = { initiatePhonePePayment, verifyPhonePePayment };
