import Joi from "joi";

export const runSchema = Joi.object({
  problem: Joi.object({
    _id: Joi.string().hex().length(24).required().trim().strict(),
    author: Joi.string().hex().length(24).required().trim().strict(),
    uuid: Joi.string().guid({ version: "uuidv4" }).required().trim().strict(),
    timeLimit: Joi.number().required().integer().label("Time limit"),
    memoryLimit: Joi.number().required().integer().label("Memory limit"),
    stackLimit: Joi.number().required().integer().label("Stack limit")
  }),
  code: Joi.object({
    langIdSolution: Joi.number()
      .required()
      .integer()
      .label("Language")
      .messages({ "number.base": `Language must be a number.` }),
    text: Joi.string().required().trim().strict().label("Code")
  }),
  testcases: Joi.array()
    .items({
      input: Joi.array().items(Joi.any()).required(),
      output: Joi.array().items(Joi.any()).required()
    })
    .required()
});

export const submitSchema = Joi.object({
  problem: Joi.object({
    _id: Joi.string().hex().length(24).required().trim().strict(),
    author: Joi.string().hex().length(24).required().trim().strict(),
    uuid: Joi.string().guid({ version: "uuidv4" }).required().trim().strict(),
    timeLimit: Joi.number().required().integer().label("Time limit"),
    memoryLimit: Joi.number().required().integer().label("Memory limit"),
    stackLimit: Joi.number().required().integer().label("Stack limit")
  }),
  code: Joi.object({
    langIdSolution: Joi.number()
      .required()
      .integer()
      .label("Language")
      .messages({ "number.base": `Language must be a number.` }),
    text: Joi.string().required().trim().strict().label("Code")
  })
});

export const handleValidate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    let errors = "";
    error.details.forEach((err) => {
      errors += `${err.message}. `;
    });
    return errors;
  }
  return null;
};
