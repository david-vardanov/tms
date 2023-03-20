// Import required modules
const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const User = require('./models/user');
require('dotenv').config();




//ROUTE CONSTS
const home = require('./routes/home');
const users = require('./routes/users');



mongoose.connect('mongodb://localhost:27017/agdDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
});

// Create a new Express application
const app = express();
// Set up session middleware
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Password or username is incorrect' });
    }

    const isValid = await user.isValidPassword(password);
    if (!isValid) {
      return done(null, false, { message: 'Password or username is incorrect' });
    }

    return done(null, user);
  } catch (error) {
    done(error);
  }
}));
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});



// Set up middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up ejs-mate as the view engine
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('uploads'));
app.use(express.static('public'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  console.log(res.locals)
  next();
});





app.use('/', home);
app.use('/', users);
app.use('/users', users);




// Define a catch-all route for 404 errors
app.use((req, res) => {
  res.status(404).send('404: Page Not Found');
});

// Set up the server to listen on a specific port
const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
