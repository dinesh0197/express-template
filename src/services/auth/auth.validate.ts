import Joi from "joi";

export const validateRegister = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required().min(8).max(32),
    email: Joi.string().email().required(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8).max(32),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateOtp = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.number().required().integer(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateResendOtp = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateUpdatePassword = (data: any) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8).max(32),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateForgotPassword = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateSetPassword = (data: any) => {
  const schema = Joi.object({
    id: Joi.string().required(),
    code: Joi.string().required(),
    password: Joi.string().required().min(8).max(32),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
