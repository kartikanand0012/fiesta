const joi = require("joi");
const universal = require("../../utils");
const Model = require("../../models");
const Codes = require("../../constants").Codes;
const Messages = require("../../constants").Messages;
const validateSchema = async (inputs, schema) => {
  try {
    let { error, _ } = schema.validate(inputs);
    if (error) throw error.details ? error.details[0].message.replace(/['"]+/g, "") : "";
    else return false;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  isAdminValid: async (req, res, next) => {
    try {
      if (req.user && req.user.guestMode) {
        next();
      } else if (req.headers.authorization) {
        const accessToken = req.headers.authorization;
        const decodeData = await universal.jwtVerify(accessToken);
        if (!decodeData) throw new Error("Invalid Auth");
        const userData = await Model.Admin.findOne({ _id: decodeData._id, isDeleted: false }).lean().exec();
        if (userData) {
          req.user = userData;
          next();
        } else {
          return universal.response(res, Codes.BAD_REQUEST, Messages.ADMIN_NOT_EXIST, "", req.lang);
        }
      } else {
        throw new Error("No Auth");
      }
    } catch (error) {
      next(error);
    }
  },
  validateSignUp: async (req, property) => {
    let schema = joi.object().keys({
      firstName: joi.string().trim().required(),
      lastName: joi.string().trim().required(),
      email: joi.string().trim().lowercase().required(),
      phone: joi
        .string()
        .regex(/^[0-9]+$/)
        .min(5)
        .required(),
      countryCode: joi
        .string()
        .regex(/^[0-9,+]+$/)
        .trim()
        .min(2)
        .required(),
      profilePic: joi.string().trim().lowercase().required(),
      password: joi.string().required(),
      deviceType: joi.string().optional(),
      deviceToken: joi.string().optional(),
    });
    return await validateSchema(req[property], schema);
  },
  validateUpdateProfile: async (req, property) => {
    let schema = joi.object().keys({
      firstName: joi.string().trim().optional(),
      lastName: joi.string().trim().optional(),
      email: joi.string().trim().lowercase().optional(),
      phone: joi
        .string()
        .regex(/^[0-9]+$/)
        .min(5)
        .optional(),
      countryCode: joi
        .string()
        .regex(/^[0-9,+]+$/)
        .trim()
        .min(2)
        .optional(),
      profilePic: joi.string().trim().lowercase().optional()
    });
    return await validateSchema(req[property], schema);
  },
  validateLogin: async (req, property) => {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });
    return await validateSchema(req[property], schema);
  },
  validateChangePassword: async (req, property) => {
    let schema = joi.object().keys({
      oldPassword: joi.string().required(),
      newPassword: joi.string().required(),
    });
    return await validateSchema(req[property], schema);
  },
  validateForgotPassword: async (req, property) => {
    let schema = joi.object().keys({
      email: joi.string().trim().lowercase().required(),
    });
    return await validateSchema(req[property], schema);
  },
  validateResetPassword: async (req, property) => {
    let schema = joi.object().keys({
      email: joi.string().trim().lowercase().required(),
      code: joi.string().required(),
      password: joi.string().required(),
    });
    return await validateSchema(req[property], schema);
  },
};
