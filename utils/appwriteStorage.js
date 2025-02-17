// const { Storage } = require("appwrite");
// const fs = require('fs');
// const client = require("./appwriteClient");

// const storage = new Storage(client);
const fs = require('fs');
const { Storage } = require("appwrite");
const client = require("./appwriteClient");

const storage = new Storage(client);

exports.uploadFile = async (file, bucketId) => {
  console.log(file)
  try {
    // Ensure the file exists before proceeding
    if (!file || !file.path) {
      throw new Error('No file found or file path is missing');
    }

    // Read the file as a stream (Appwrite requires a stream or buffer)
    const fileStream = fs.createReadStream(file.path);

    // Upload the file to Appwrite's storage using createFile
    const response = await storage.createFile(bucketId, 'unique()', fileStream);

    // Return the response from Appwrite (file details)
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error(error.message);
  }
};



// exports.uploadFile = async (file, bucketId) => {
//   try {
//     const response = await storage.createFile(bucketId, "unique()", file);
//     return response;
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

exports.deleteFile = async (bucketId, fileId) => {
    try {
      await storage.deleteFile(bucketId, fileId);
      console.log(`File with ID ${fileId} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting file:', error.message);
      throw new Error('Failed to delete file from Appwrite');
    }
  };

exports.getFileViewURL = (bucketId, fileId) => {
  return storage.getFileView(bucketId, fileId);
};
