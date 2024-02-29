import Joi from "joi";

export const updateSchema = Joi.object({
    classCurr: Joi.string()
        .hex()
        .length(24)
        .required()
        .trim()
        .strict()
        .label("Class"),
    fullName: Joi.string()
        .required()
        .min(10)
        .max(25)
        .trim()
        .strict()
        .label("Full name"),
    studentCode: Joi.string()
        .required()
        .length(10)
        .trim()
        .strict()
        .label("Student code"),
    avatar: Joi.string()
        .required()
        .min(0)
        .max(128)
        .trim()
        .strict()
        .label("Avatar"),
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
