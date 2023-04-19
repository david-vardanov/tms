const { paymentSchema,documentSchema, CarrierSchema } = require('../models/carrier')
const { BusinessSchema } = require('../models/business')

const Joi = require('joi');

const validationSchemas = {
  businessSchema: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    address2: Joi.string().optional().allow(""),
    zip: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    phone: Joi.string().required(),
    einNumber: Joi.string().required(),
    token: Joi.string(), // 
    dotNumber: Joi.string().required(),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Deactivated', 'Pending', 'inModeration', 'Declined')
      .optional(),
    createdBy: Joi.string().optional(),
    updatedBy: Joi.string().optional(),
  }),
  documentSchema: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('coi', 'noa', 'voidCheck', 'MCAuthority', 'w9', 'other', 'agreement').required(),
    url: Joi.string().required(),
  }),
  paymentSchema: Joi.object({
    paymentMethod: Joi.string()
      .valid('factoring','standart', 'quickpay1', 'quickpay2', 'quickpay3')
      .required(),
  }),
  CarrierSchema: Joi.object({
    ...BusinessSchema.obj,
    ownerName: Joi.string().required(),
    signature: Joi.string().required(),
    dispatcherName: Joi.string().required(),
    dispatcherEmail: Joi.string().email().required(),
    dispatcherPhone: Joi.string().required(),
    payment: paymentSchema,
    documents: Joi.array().items(documentSchema).required(),
  }),
};


module.exports = {
  validateInput: (schema, property) => {
    return (req, res, next) => {
      const { error } = schema.validate(req[property], { abortEarly: false });
      const valid = error == null;

      if (valid) {
        next();
      } else {
        const { details } = error;
        const errors = details.map(i => i.message).join(',');
        console.error('Validation error:', errors);
        res.status(422).json({ error: errors })
      }
    }
  },
  validationSchemas,
};
