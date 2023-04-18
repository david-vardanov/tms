const Joi = require('joi');

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
    const { error } = carrierSetupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      req.flash('validationErrors', errors);
      req.session.redirectUrl = req.originalUrl; // Store the unique URL in the session
      return res.redirect(req.session.redirectUrl);
    }
    next();
};

  


  module.exports = {
    validateCarrierSetup,
    validateLogin,
  };



  