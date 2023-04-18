const Joi = require('joi');
const jwt = require('jsonwebtoken');

const carrierSetupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
  address: Joi.string().required(),
  address2: Joi.string().optional().allow(""),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  einNumber: Joi.string().required(),
  dotNumber: Joi.string().required(),
  paymentMethod: Joi.string().valid('factoring', 'quickpay').required(),
  token: Joi.string().required(),
  coi: Joi.any().required(),
  liabilityInsuranceCertificate: Joi.any().required(),
  noa: Joi.any().optional(),
  voidCheck: Joi.any().optional(),
  ownerName: Joi.string().required(), 
  signature: Joi.string().required(), 
  dispatcherName: Joi.string().required(), 
  dispatcherEmail: Joi.string().email().required(),
  dispatcherPhone: Joi.string().required(), 
  documents: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('coi', 'noa', 'voidCheck', 'MCAuthority', 'w9', 'other', 'agreement' ),
      url: Joi.string().required(),
      name: Joi.string().required()
    })
  ).optional()
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });


  const validateCarrierSetup = (req, res, next) => {
    console.log("Original URL:", req.originalUrl);
    const { error } = carrierSetupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      console.log("Validation errors:", errors);
      req.flash('validationErrors', errors);
      
      // Get the ObjectId from the token or another source
      const { inviteId } = jwt.verify(req.body.token, process.env.JWT_SECRET);
      // Redirect back to the correct URL with the ObjectId
      return res.redirect(`/carriers/carrier-setup?token=${inviteId}/submit-carrier-setup`);
    }
    next();
  };
  

  const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ success: false, errors });
    }
    next();
  };
  


  module.exports = {
    validateCarrierSetup,
    validateLogin,
  };



  