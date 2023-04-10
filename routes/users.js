const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require("bcrypt");
const paginate = require('express-paginate');
const User = require('../models/user');
const { validateLogin } = require('../middlewares/validation');
const isAuthenticated = require('../middlewares/authMiddleware');




// Define login route
router.route('/login')
  .get((req, res) => {
    res.render('login', {
        title: 'Login'
      }); 
  })
  .post(validateLogin, async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        console.log('Error during authentication:', err);
        return next(err);
      }
      if (!user) {
        console.log('Authentication failed:', info.message);
        return res.redirect('/login');
      }
      req.logIn(user, (err) => {
        if (err) {
          console.log('Error during login:', err);
          return next(err);
        }
        console.log('User after authentication:', req.user);
        return res.redirect('/');
      });
    })(req, res, next);
  });

// Define logout route
router.route('/logout')
  .get((req, res) => {
    req.logout(() => {});
    res.redirect('/');
  });

  //NEW USER
  //GET
  router.get("/new", (req, res) => {
    res.render("user/new", { title: "Create User" });
  });
  //POST
  router.post("/", async (req, res) => {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
        createdBy: req.user._id,
        updatedBy: req.user._id,
      });
  
      await user.save();
  
      res.redirect("/users/list");
    } catch (error) {
      console.log(error);
      res.render("user/new", {
        title: "Create User",
        error: "Failed to create user. Please try again.",
      });
    }
  });


  router.get('/list',isAuthenticated, paginate.middleware(10, 50), async (req, res) => {
    if (req.isAuthenticated()) {
  
      const filter = {};
     const [userResults] = await Promise.all([
        User.find(filter).sort({ updatedAt: 'desc' }).limit(req.query.limit).skip(req.skip).lean().exec(),
      ]);
  
      const [userCount] = await Promise.all([
        User.countDocuments(filter),
      ]);
  
      const pageCountUsers = Math.ceil(userCount / req.query.limit);
      
      res.render('user/list', {
        user: req.user,
        title: "List of Users",
        users: userResults,
        pageCountUsers,
        pagesUsers: paginate.getArrayPages(req)(3, pageCountUsers, req.query.page),
      });
    } else {
      res.render('dashboard', {
        user: req.user,title: "Dashboard"
      });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Find the carrier by its ID
      const user = await User.findById(userId);
  
      if (user) {
         
        // Remove the carrier from the database
        await User.findByIdAndRemove(userId);
        res.status(200).json({ success: true, message: 'User deleted successfully.' });
      } else {
        res.status(404).json({ success: false, message: 'User not found.' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error.' });
    }
  });

  
// Export the router
module.exports = router;




