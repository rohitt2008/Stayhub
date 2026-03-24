require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'stayhub', allowed_formats: ['jpg', 'png', 'pdf'] }
});

module.exports = { cloudinary, upload: multer({ storage }) };
```

**Step 4 — Replace your existing multer upload** in your routes/controllers with this new `upload` from cloudinary.js

