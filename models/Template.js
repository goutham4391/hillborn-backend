const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  zipFile: {
    type: String, // Path to the stored ZIP file on the server
    required: true,
  },
  previewUrl: {
    type: String, // URL to preview the template
    required: true,
  },
  image: {
    type: Buffer, // Path to the stored image on the server
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Template', templateSchema);
