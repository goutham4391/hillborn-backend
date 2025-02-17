  const Template = require('../models/Template');
const User = require('../models/User');
  const path = require('path');
  const fs = require('fs');
  const multer = require('multer');
  const sharp = require('sharp');

  // Utility function for sending error responses
  const sendErrorResponse = (res, statusCode, message, error) => {
    console.error(message, error);
    res.status(statusCode).json({ success: false, message, error: error?.message });
  };

  // Configure multer for file upload
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, '../uploads'), // Define upload folder
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)) // Unique file name
  });

  const upload = multer({ storage }).fields([{ name: 'zipFile' }, { name: 'image' }]);

  // Helper function to validate file types
  const validateFileType = (file, allowedTypes) => allowedTypes.includes(file.mimetype);

  // Add a new template
  exports.addTemplate = async (req, res) => {
    
    try {
      upload(req, res, async (err) => {
        if (err) return sendErrorResponse(res, 500, 'File upload error', err);

        const { name, description, price, previewUrl } = req.body;

        // Validate request data and files
        if (!name || !description || !price || !req.files || !req.files.zipFile || !req.files.image) {
          return res.status(400).json({ success: false, message: 'Invalid input or missing files' });
        }

        const zipFile = req.files.zipFile[0];
        const imageFile = req.files.image[0];

        // Validate file types
        if (!validateFileType(zipFile, ['application/zip'])) {
          return res.status(400).json({ success: false, message: 'Only .zip files are allowed' });
        }

        if (!validateFileType(imageFile, ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'])) {
          return res.status(400).json({ success: false, message: 'Only image files are allowed' });
        }

        const timestamp = Date.now();
        const zipFileName = `${timestamp}_${zipFile.originalname}`;
        const imageFileName = `${timestamp}_${imageFile.originalname}`;
        const zipFilePath = path.join(__dirname, '../../uploads', zipFileName);

        try {
          // Save files
          fs.copyFileSync(zipFile.path, zipFilePath);

          // Optimize and store image as buffer in MongoDB
          const optimizedImageBuffer = await sharp(imageFile.path)
            .resize(800, 800, { fit: 'inside' })
            .toFormat('jpeg')
            .jpeg({ quality: 80 })
            .toBuffer();

          // Save template to the database
          const template = await Template.create({
            name,
            description,
            price,
            previewUrl,
            zipFile: zipFilePath,
            image: optimizedImageBuffer // Store the image as Buffer in MongoDB
          });

          // Cleanup temporary files
          fs.unlinkSync(zipFile.path);
          fs.unlinkSync(imageFile.path);

          res.status(201).json({ success: true, data: template });
        } catch (fileError) {
          sendErrorResponse(res, 500, 'Error processing files', fileError);
        }
      });
    } catch (error) {
      sendErrorResponse(res, 500, 'Error adding template', error);
    }
  };

  // Get all templates
  exports.getAllTemplates = async (req, res) => {
    try {
      const templates = await Template.find({}, 'name description price previewUrl zipFile image createdAt');
      
      const formattedTemplates = templates.map(template => ({
        ...template.toObject(),
        // Send the image as base64 in response instead of file path
        image: template.image ? `data:image/jpeg;base64,${template.image.toString('base64')}` : null
      }));

      res.status(200).json({ success: true, data: formattedTemplates });
    } catch (error) {
      sendErrorResponse(res, 500, 'Error fetching templates', error);
    }
  };

  // Get a single template by ID
  exports.getTemplateById = async (req, res) => {
    try {
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }

      res.status(200).json({
        success: true,
        data: {
          ...template.toObject(),
          // Send the image as base64 in response
          image: template.image ? `data:image/jpeg;base64,${template.image.toString('base64')}` : null
        }
      });
    } catch (error) {
      sendErrorResponse(res, 500, 'Error fetching template', error);
    }
  };

  // Delete a template
  exports.deleteTemplate = async (req, res) => {
    try {
      const template = await Template.findById(req.params.id);
      if (!template) {
        return res.status(404).json({ success: false, message: 'Template not found' });
      }

      // Delete the zip file from the server
      if (fs.existsSync(template.zipFile)) fs.unlinkSync(template.zipFile);

      // Delete template from the database
      await Template.findByIdAndDelete(req.params.id);

      res.status(200).json({ success: true, message: 'Template deleted successfully' });
    } catch (error) {
      sendErrorResponse(res, 500, 'Error deleting template', error);
    }
  };

  // Download a zip file
  // Modify the downloadTemplate controller to check for purchase

  exports.downloadTemplate = async (req, res) => {
    try {
        // const user = req.user;
        // console.log("User:", user);

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

      const user = await User.findById(req.user.id);

        const template = await Template.findById(req.params.id);
        // console.log("Template:", template);

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
        }

        // Ensure orders array exists and contains template ID as a string
        if (!Array.isArray(user.orders) || !user.orders.map(order => order.toString()).includes(template._id.toString())) {
          console.log("no");
            return res.status(403).json({ success: false, message: 'You have not purchased this template' });
        }

        const filePath = path.resolve(__dirname, '../uploads', template.zipFile);
        console.log("File Path:", filePath);
      if (fs.existsSync(filePath)) {
    console.log("✅ File exists");
} else {
    console.log("❌ File does NOT exist");
}

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found' });
        }
      console.log(fs.existsSync(filePath));

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('X-Template-Name', template.name);
        res.setHeader('Content-Disposition', `attachment; filename="${template.name}.zip"`);

        const fileStream = fs.createReadStream(filePath);
      console.log(fileStream);
        fileStream.pipe(res);

        fileStream.on('error', (err) => {
            console.error('File stream error:', err);
            res.end();
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ success: false, message: 'Error downloading template' });
    }
};
  exports.updateTemplate = async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) return sendErrorResponse(res, 500, 'File upload error', err);

        const { name, description, price, previewUrl } = req.body;

        // Validate request data
        if (!name || !description || !price) {
          return res.status(400).json({ success: false, message: 'Invalid input' });
        }

        const templateId = req.params.id;

        try {
          const template = await Template.findById(templateId);

          if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found' });
          }

          let zipFilePath = template.zipFile;
          let optimizedImageBuffer = template.image;

          // Handle new zip file
          if (req.files && req.files.zipFile) {
            const zipFile = req.files.zipFile[0];

            if (!validateFileType(zipFile, ['application/zip'])) {
              return res.status(400).json({ success: false, message: 'Only .zip files are allowed' });
            }

            // Delete the old zip file
            if (fs.existsSync(zipFilePath)) {
              fs.unlinkSync(zipFilePath);
            }

            const timestamp = Date.now();
            zipFilePath = path.join(__dirname, '../../uploads', `${timestamp}_${zipFile.originalname}`);
            fs.copyFileSync(zipFile.path, zipFilePath);
            fs.unlinkSync(zipFile.path);
          }

          // Handle new image file
          if (req.files && req.files.image) {
            const imageFile = req.files.image[0];

            if (!validateFileType(imageFile, ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'])) {
              return res.status(400).json({ success: false, message: 'Only image files are allowed' });
            }

            // Optimize and delete old image buffer (if needed)
            optimizedImageBuffer = await sharp(imageFile.path)
              .resize(800, 800, { fit: 'inside' })
              .toFormat('jpeg')
              .jpeg({ quality: 80 })
              .toBuffer();

            fs.unlinkSync(imageFile.path);
          }

          // Update template fields
          template.name = name;
          template.description = description;
          template.price = price;
          template.previewUrl = previewUrl;
          template.zipFile = zipFilePath;
          template.image = optimizedImageBuffer;

          await template.save();

          res.status(200).json({ success: true, data: template });
        } catch (error) {
          sendErrorResponse(res, 500, 'Error updating template', error);
        }
      });
    } catch (error) {
      sendErrorResponse(res, 500, 'Error processing request', error);
    }
  };
 


