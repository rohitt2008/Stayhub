const multer = require('multer');


const randomString = (length) => {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check which field is being uploaded to choose folder
    if (file.fieldname === 'rulesDocument') {
      cb(null, path.join(__dirname, '..', 'rules'));
    } else {
      cb(null, path.join(__dirname, '..', 'uploads'));
    }
  },
  filename: (req, file, cb) => {
    cb(null, randomString(10) + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'photo') {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  } else if (file.fieldname === 'rulesDocument') {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      console.log("REJECTED! Mimetype was:", file.mimetype); // This will tell us if it's a type error
      cb(null, false);
    } 
  } else {
    cb(null, false);
  }
};
const multerOptions = {
  storage , fileFilter 
}

module.exports = multer({ storage, fileFilter });