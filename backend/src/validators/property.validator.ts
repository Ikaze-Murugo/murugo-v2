import Joi from 'joi';

export const createPropertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  propertyType: Joi.string()
    .valid('house', 'apartment', 'office', 'land', 'studio', 'villa', 'commercial')
    .required(),
  transactionType: Joi.string().valid('rent', 'sale', 'lease').required(),
  price: Joi.number().positive().required(),
  currency: Joi.string().default('RWF'),
  location: Joi.object({
    district: Joi.string().required(),
    sector: Joi.string().required(),
    cell: Joi.string().allow('').optional(),
    address: Joi.string().required(),
    latitude: Joi.number().allow(null).optional(),
    longitude: Joi.number().allow(null).optional(),
  }).required(),
  amenities: Joi.array().items(Joi.string()).optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  sizeSqm: Joi.number().positive().optional(),
  parkingSpaces: Joi.number().integer().min(0).optional(),
  floorNumber: Joi.number().integer().optional(),
  yearBuilt: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  availabilityDate: Joi.date().optional(),
});

export const updatePropertySchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  propertyType: Joi.string()
    .valid('house', 'apartment', 'office', 'land', 'studio', 'villa', 'commercial')
    .optional(),
  transactionType: Joi.string().valid('rent', 'sale', 'lease').optional(),
  price: Joi.number().positive().optional(),
  location: Joi.object({
    district: Joi.string().required(),
    sector: Joi.string().required(),
    cell: Joi.string().allow('').optional(),
    address: Joi.string().required(),
    latitude: Joi.number().allow(null).optional(),
    longitude: Joi.number().allow(null).optional(),
  }).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  bedrooms: Joi.number().integer().min(0).optional(),
  bathrooms: Joi.number().integer().min(0).optional(),
  sizeSqm: Joi.number().positive().optional(),
  parkingSpaces: Joi.number().integer().min(0).optional(),
  floorNumber: Joi.number().integer().optional(),
  yearBuilt: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  availabilityDate: Joi.date().optional(),
  status: Joi.string().valid('available', 'rented', 'sold', 'pending').optional(),
});
