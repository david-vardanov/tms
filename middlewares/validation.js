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
  paymentMethod: Joi.string().valid("factoring","standart", "quickpay1", "quickpay2", "quickpay3").required(),
  token: Joi.string().required(),
  coi: Joi.array().items(
    Joi.object().unknown().keys({
      fieldname: Joi.string().optional(),
      mimetype: Joi.string().optional(),
      size: Joi.number().optional(),
      location: Joi.string().optional(),
    })
  ).optional(),
  MCAuthority: Joi.array().items(
    Joi.object().unknown().keys({
      fieldname: Joi.string().optional(),
      mimetype: Joi.string().optional(),
      size: Joi.number().optional(),
      location: Joi.string().optional(),
    })
  ).optional(),
  w9: Joi.array().items(
    Joi.object().unknown().keys({
      fieldname: Joi.string().optional(),
      mimetype: Joi.string().optional(),
      size: Joi.number().optional(),
      location: Joi.string().optional(),
    })
  ).optional(),
  noa: Joi.array().items(
    Joi.object().unknown().keys({
      fieldname: Joi.string().optional(),
      mimetype: Joi.string().optional(),
      size: Joi.number().optional(),
      location: Joi.string().optional(),
    })
  ),
  voidCheck: Joi.array().items(
    Joi.object().unknown().keys({
      fieldname: Joi.string().optional(),
      mimetype: Joi.string().optional(),
      size: Joi.number().optional(),
      location: Joi.string().optional(),
    })
  ),
  other: Joi.array().items(
    Joi.object().unknown().keys({
      fieldname: Joi.string().optional(),
      mimetype: Joi.string().optional(),
      size: Joi.number().optional(),
      location: Joi.string().optional(),
    })
  ).optional(),
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
    const combinedFiles = {
      ...req.session.files,
      ...req.files
    };
  
    const dataToValidate = {
      ...req.body,
      coi: combinedFiles['coi'],
      MCAuthority: combinedFiles['MCAuthority'],
      w9: combinedFiles['w9'],
      other: combinedFiles['other'],
      noa: combinedFiles['noa'],
      voidCheck: combinedFiles['voidCheck'],
    };
  
    const { error } = carrierSetupSchema.validate(dataToValidate, { abortEarly: false });
    if (error) {
      const errors = error.details.map((err) => err.message);
      req.flash('validationErrors', errors);
      req.session.files = combinedFiles;
      return res.redirect(`/carriers/carrier-setup?token=${req.body.token}&data=${JSON.stringify(req.body)}`);
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



  