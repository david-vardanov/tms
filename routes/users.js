const express = require('express');
const router = express.Router();
const passport = require('passport');
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

  
// Export the router
module.exports = router;




