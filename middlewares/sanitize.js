const expressSanitizer = require('express-sanitizer');


const sanitizeInput = (input, req) => {
    const sanitizedInput = {};
    for (const key in input) {
      if (typeof input[key] === 'string') {
        sanitizedInput[key] = req.sanitize(input[key]);
      } else {
        sanitizedInput[key] = input[key];
      }
    }
    return sanitizedInput;
  };
  

  module.exports = { sanitizeInput }