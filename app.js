// Core Module
require('dotenv').config();
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const rulesDir = path.join(__dirname, 'rules');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

if (!fs.existsSync(rulesDir)) {
  fs.mkdirSync(rulesDir);
  console.log('Created rules directory');
}

// External Module
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
const DB_PATH = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!DB_PATH) {
  console.error("=============================================================");
  console.error("FATAL ERROR: Database connection string is missing!");
  console.error("Please ensure either MONGO_URI or MONGODB_URI is set");
  console.error("in your Render dashboard environment variables.");
  console.error("=============================================================");
  process.exit(1);
}

//Local Module
const storeRouter = require("./routes/storeRouter")
const hostRouter = require("./routes/hostRouter")
const authRouter = require("./routes/authRouter")
const rootDir = require("./utils/pathUtil");
const errorsController = require("./controllers/errors");
const { default: mongoose } = require('mongoose');
const { rule } = require('postcss');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const store = new MongoDBStore({
  uri: DB_PATH,
  collection: 'sessions'
});

app.use(express.urlencoded());
app.use(express.static(path.join(rootDir, 'public')))
app.use("/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/host/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/homes/uploads", express.static(path.join(rootDir, 'uploads')))
app.use("/rules", express.static(path.join(rootDir, 'rules')))



app.use(session({
  secret: "KnowledgeGate AI with Complete Coding",
  resave: false,
  saveUninitialized: true,
  store
}));

app.use((req, res, next) => {
  req.isLoggedIn = req.session.isLoggedIn
  next();
})

app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED';
  if (dbStatus === 'CONNECTED') {
    res.status(200).json({
      status: 'UP',
      database: dbStatus,
      timestamp: new Date()
    });
  } else {
    res.status(503).json({
      status: 'DOWN',
      database: dbStatus,
      timestamp: new Date()
    });
  }
});

app.use(authRouter)
app.use(storeRouter);
app.use("/host", (req, res, next) => {
  if (req.isLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
});
app.use("/host", hostRouter);


app.use(errorsController.pageNotFound);

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});

mongoose.connect(DB_PATH).then(() => {
  console.log('Connected to Mongo');
}).catch(err => {
  console.log('Error while connecting to Mongo: ', err);
});