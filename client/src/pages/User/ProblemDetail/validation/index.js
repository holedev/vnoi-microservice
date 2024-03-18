import Joi from 'joi';

export const runSchema = Joi.object({
  problem: Joi.object({
    _id: Joi.string().hex().length(24).required().trim().strict(),
    author: Joi.string().hex().length(24).required().trim().strict(),
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().trim().strict(),
  }),
  code: Joi.string()
    .required()
    .trim()
    .strict()
    .pattern(/main()/)
    .label('Code editor')
    .messages({
      'string.pattern.base': `Code must be have main function (main()).`,
    }),
  testcases: Joi.object({
    input: Joi.array().items(Joi.any()).required(),
    output: Joi.array().items(Joi.any()).required(),
  }).required(),
});

export const submitSchema = Joi.object({
  problem: Joi.object({
    _id: Joi.string().hex().length(24).required().trim().strict(),
    author: Joi.string().hex().length(24).required().trim().strict(),
    uuid: Joi.string().guid({ version: 'uuidv4' }).required().trim().strict(),
  }),
  code: Joi.string()
    .required()
    .trim()
    .strict()
    .pattern(/main()/)
    .label('Code editor')
    .messages({
      'string.pattern.base': `Code must be have main function (main()).`,
    }),
});

export const handleValidate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    let errors = '';
    error.details.forEach((err) => {
      errors += `${err.message}. `;
    });
    return errors;
  }
  return null;
};
