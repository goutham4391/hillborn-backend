require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const passport = require("passport");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

require("./config/passport");

const authRoutes = require('./routes/authRoute');
const templateRoutes = require('./routes/templateRoute');
const orderRoutes = require('./routes/orderRoute');

// Initialize the app
const app = express();

// Database connection
connectDB();

// Middlewares
app.use(cookieParser());
const corsOptions = {
  origin: "https://hillbornsolutions.com",
  methods: "GET,POST,PUT,DELETE,PATCH,HEAD",
  allowedHeaders: ['Content-Type',"Authorization", 'X-Template-Name'],
  exposedHeaders: ['X-Template-Name'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
// app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => {
  res.send('Hello World');
});

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api', templateRoutes);
app.use('/api/orders',orderRoutes)

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
