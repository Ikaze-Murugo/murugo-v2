import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('seeker', 'lister').required(),
  profileType: Joi.string().valid('individual', 'commissioner', 'company').optional(),
  name: Joi.string().allow('').optional(),
  whatsappNumber: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  password: Joi.string().required(),
}).or('email', 'phone');

export const verifyOTPSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
});
