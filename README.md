# StayHub 🏡

**StayHub** is a full-stack StayHub-style booking platform built with  
**Node.js, Express, MongoDB, EJS, and Tailwind CSS**.

It supports **authentication, session-based login, host & guest roles,
home listings, favourites, bookings, and file uploads**.

---

## 🚀 Features

### 👤 Authentication & Authorization
- User signup & login
- Session-based authentication
- Role-based users: **Host** & **Guest**
- Secure logout

### 🏠 Homes Management (Host)
- Add new homes
- Edit existing homes
- Upload images
- Upload house-rules PDF
- View host-owned homes

### 🧳 Guest Features
- Browse available homes
- View home details
- Add/remove favourites
- Make bookings
- View bookings

### ❤️ Favourites
- Add homes to favourites
- Remove homes from favourites
- Persistent favourites per user

### 📁 File Uploads
- Image uploads (homes)
- PDF uploads (house rules)
- Files ignored from GitHub using `.gitignore`

---

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- express-session
- connect-mongodb-session

### Frontend
- EJS (templating)
- Tailwind CSS

### Other Tools
- Multer (file uploads)
- Express Validator (form validation)
- Nodemon (development)

---

## 📂 Project Structure

StayHub/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── views/
│ ├── auth/
│ ├── host/
│ ├── store/
│ └── partials/
├── public/
├── uploads/ (ignored)
├── rules/ (ignored)
├── app.js
├── package.json
└── .gitignore

---

## ⚙️ Environment Setup

Create a `.env` file in the root:

```env
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
▶️ Run Locally
git clone https://github.com/rohitt2008/Stayhub.git
cd Stayhub
npm install
npm start
Visit:
http://localhost:3000
🔐 Authentication Logic
Sessions stored in MongoDB
Session data exposed globally using res.locals
Navbar updates automatically based on login state
👨‍💻 Author
Rohit Kumar
GitHub: https://github.com/rohitt2008
