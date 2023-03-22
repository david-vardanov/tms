const handleError = (req, res) => {
    res.status(404).send('404: Page Not Found');
  };
  
  const setUserLocal = (req, res, next) => {
    res.locals.user = req.user;
    next();
  };
  
  module.exports = {
    handleError,
    setUserLocal
  };
  