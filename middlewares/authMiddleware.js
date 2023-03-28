const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      // Redirect to the login page or send an error response
      res.redirect('/login');
      // Or: res.status(401).send('Unauthorized');
    }
  };
  
  module.exports = isAuthenticated;
  