import Joi from 'joi';

export const createSchema = Joi.object({
  title: Joi.string().required().max(50).trim().strict().label('Title'),
  level: Joi.number().valid(0, 1, 2).required().label('Level'),
  alwayOpen: Joi.boolean().required().label('Always open'),
  timeStart: Joi.any(),
  testTime: Joi.when('alwayOpen', {
    is: false,
    then: Joi.number().required().min(15),
  }).label('Test time'),
  desc: Joi.string().required().trim().strict().label('Description'),
  initCode: Joi.string()
    .required()
    .pattern(/^```[\s\S]+```$/)
    .trim()
    .strict()
    .label('Init code')
    .messages({
      'string.pattern.base': `"Init code" must enclosed between \`\`\` marks.`,
    }),
  langIdSolution: Joi.number().required().label('Language solution'),
  solution: Joi.string()
    .required()
    .pattern(/^```[\s\S]+```$/)
    .trim()
    .strict()
    .label('Solution')
    .messages({
      'string.pattern.base': `"Solution" must be enclosed between \`\`\` marks.`,
    }),
  classCurr: Joi.string()
    .hex()
    .length(24)
    .required()
    .trim()
    .strict()
    .label('Class'),
  script: Joi.object({
    generateCode: Joi.string()
      .pattern(/^```[\s\S]+```$/)
      .strict()
      .label('Generate code')
      .messages({
        'string.pattern.base': `"Generate code" must enclosed between \`\`\` marks.`,
      }),
    quantity: Joi.number()
      .required()
      .min(3)
      .max(200)
      .label('Testcase quantity'),
    data: Joi.array().items(Joi.string()).min(3).max(200),
    file: Joi.boolean().required().label('File'),
  }),
  timeLimit: Joi.number().required().min(0).max(2).label('Time limit'),
  memoryLimit: Joi.number()
    .required()
    .min(1024)
    .max(128000)
    .label('Memory limit'),
  stackLimit: Joi.number().required().min(1024).max(64000).label('Stack limit'),
  availableLanguages: Joi.array()
    .items(
      Joi.number().valid(
        45,
        46,
        47,
        75,
        76,
        48,
        52,
        49,
        53,
        50,
        54,
        86,
        51,
        77,
        55,
        56,
        57,
        58,
        44,
        87,
        59,
        60,
        88,
        61,
        62,
        63,
        78,
        64,
        89,
        79,
        65,
        66,
        67,
        85,
        68,
        43,
        69,
        70,
        71,
        80,
        72,
        73,
        81,
        82,
        83,
        74,
        84
      )
    )
    .required()
    .label('Available languages'),
});

export const updateSchema = Joi.object({
  uuid: Joi.string().guid({ version: 'uuidv4' }).required().label('UUID'),
  title: Joi.string().required().max(50).trim().strict().label('Title'),
  level: Joi.number().valid(0, 1, 2).required().label('Level'),
  alwayOpen: Joi.boolean().required().label('Always open'),
  timeStart: Joi.any(),
  testTime: Joi.when('alwayOpen', {
    is: false,
    then: Joi.number().required().min(15),
  }).label('Test time'),
  desc: Joi.string().required().trim().strict().label('Description'),
  initCode: Joi.string()
    .required()
    .pattern(/^```[\s\S]+```$/)
    .trim()
    .strict()
    .label('Init code')
    .messages({
      'string.pattern.base': `"Init code" must enclosed between \`\`\` marks.`,
    }),
  solution: Joi.string()
    .required()
    .pattern(/^```[\s\S]+```$/)
    .trim()
    .strict()
    .label('Solution')
    .messages({
      'string.pattern.base': `"Solution" must be enclosed between \`\`\` marks.`,
    }),
  classCurr: Joi.string()
    .hex()
    .length(24)
    .required()
    .trim()
    .strict()
    .label('Class'),
  script: Joi.object({
    generateCode: Joi.string()
      .pattern(/^```[\s\S]+```$/)
      .trim()
      .strict()
      .label('Generate code')
      .messages({
        'string.pattern.base': `"Generate code" must enclosed between \`\`\` marks.`,
      }),
    quantity: Joi.number()
      .required()
      .min(3)
      .max(200)
      .label('Testcase quantity'),

    data: Joi.array().items(Joi.string()).min(3).max(200),
    file: Joi.boolean().required().label('File'),
  }),
});

export const handleValidate = (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    let errors = '';
    error.details.forEach((err, idx) => {
      if (idx < 3) errors += `${err.message}. `;
    });
    return errors;
  }
  return null;
};
