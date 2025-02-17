const { Client } = require("appwrite");

const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID); // Your Appwrite project ID

module.exports = client;
