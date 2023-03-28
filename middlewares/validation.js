const Joi = require('joi');

const carrierSetupSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().required(),
  phone: Joi.string().optional(),
  address: Joi.string().required(),
  address2: Joi.string().optional(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip: Joi.string().required(),
  einNumber: Joi.string().optional(),
  dotNumber: Joi.string().optional(),
  paymentMethod: Joi.string().valid('factoring', 'quickpay').required(),
  token: Joi.string().required(),
  coi: Joi.any().optional(),
  liabilityInsuranceCertificate: Joi.any().optional(),
  noa: Joi.any().optional(),
  voidCheck: Joi.any().optional(),
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });


const validateCarrierSetup = (req, res, next) => {
    console.log(req.body)
    const { error } = carrierSetupSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      return res.status(400).json({ success: false, errors });
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



  