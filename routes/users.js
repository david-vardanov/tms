const express = require('express');
const router = express.Router();
const passport = require('passport');
// Define login route
router.route('/login')
  .get((req, res) => {
    res.render('login', {
        title: 'Login'
      }); 
  })
  .post((req, res, next) => {
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

// Export the router
module.exports = router;




