const { paymentSchema,documentSchema, CarrierSchema } = require('../models/carrier')
const { BusinessSchema } = require('../models/business')

const Joi = require('joi');

const validationSchemas = {
  businessSchema: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    address2: Joi.string().optional(),
    zip: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    phone: Joi.string().optional(),
    einNumber: Joi.string().optional(),
    token: Joi.string(), // Include token property in the schema
    dotNumber: Joi.string().optional(),
    status: Joi.string()
      .valid('Active', 'Inactive', 'Deactivated', 'Pending', 'inModeration', 'Declined')
      .optional(),
    createdBy: Joi.string().optional(),
    updatedBy: Joi.string().optional(),
  }),
  documentSchema: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('coi', 'noa', 'voidCheck', 'liabilityInsuranceCertificate').required(),
    url: Joi.string().required(),
  }),
  paymentSchema: Joi.object({
    paymentMethod: Joi.string()
      .valid('factoring', 'quickpay1', 'quickpay3', 'quickpay5')
      .required(),
  }),
  CarrierSchema: Joi.object({
    ...BusinessSchema.obj,
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
