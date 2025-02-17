const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const templateController = require('../controllers/templateController');
const Template = require('../models/Template');
const verifyToken = require('../middleware/authmiddleware');
const Order = require('../models/Order');
const User = require('../models/User');

// Ensure the 'uploads' directory exists


// Route to add a new template
router.post('/template',verifyToken(['admin']),templateController.addTemplate);

router.get('/templates/:id/download',verifyToken(['admin','user']), templateController.downloadTemplate)

router.put('/template/:id',verifyToken(['admin','user']),verifyToken(['admin']),templateController.updateTemplate);

// Route to get all templates
router.get('/templates',templateController.getAllTemplates);

// Route to get a specific template by ID
router.get('/template/:id', templateController.getTemplateById)

// Route to delete a template
router.delete('/template/:id',verifyToken(['admin']),templateController.deleteTemplate)

router.get("/user/templates", verifyToken(["user","admin"]), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
      const templates = await Template.find({_id:user.orders});
      
      res.status(200).json({ templates });
    } catch (error) {
      res.status(500).json({ message: "Error fetching templates", error });
    }
  });
  

// Route to update a template
// router.put('/template/:id', upload.fields([
//   { name: 'zipFile', maxCount: 1 },
//   { name: 'image', maxCount: 1 }
// ]), async (req, res) => {
//   try {
//     const { name, description, price, previewUrl } = req.body;
    
//     // Get the uploaded files if present
//     const zipFile = req.files ? req.files.zipFile : null;
//     const imageFile = req.files ? req.files.image : null;

//     const updatedData = {
//       name,
//       description,
//       price,
//       previewUrl,
//     };

//     if (zipFile) {
//       const zipFileBuffer = fs.readFileSync(zipFile[0].path); // Read file into a Buffer
//       updatedData.zipFile = zipFileBuffer;
//     }

//     if (imageFile) {
//       const imageBuffer = fs.readFileSync(imageFile[0].path); // Read image file into a Buffer
//       updatedData.image = imageBuffer;
//     }

//     const template = await Template.findByIdAndUpdate(req.params.id, updatedData, { new: true });

//     if (!template) {
//       return res.status(404).json({ success: false, message: 'Template not found' });
//     }

//     // Optionally, delete the temporary files after they're saved to MongoDB
//     if (zipFile) {
//       fs.unlinkSync(zipFile[0].path);  // Delete the temporary ZIP file
//     }
//     if (imageFile) {
//       fs.unlinkSync(imageFile[0].path); // Delete the temporary image file
//     }

//     res.status(200).json({ success: true, data: template });
//   } catch (error) {
//     console.error('Error updating template:', error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

module.exports = router;
