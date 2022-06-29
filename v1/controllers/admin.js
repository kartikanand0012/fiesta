const config = require("config");
const validations = require("../validations");
const universal = require("../../utils");
const MESSAGES = require("../../constants").Messages;
const CODES = require("../../constants").Codes;
const Models = require('../../models');
const ObjectId = require('mongoose').Types.ObjectId;
const moment = require('moment');
const Projections = {
  signUp: { "password": 0, "deviceToken": 0, "deviceType": 0, "createdAt": 0, "updatedAt": 0, "__v": 0 },
  login: { "deviceToken": 0, "deviceType": 0, "createdAt": 0, "updatedAt": 0, "__v": 0 },
  getProfile: { "password": 0, "deviceToken": 0, "deviceType": 0, "createdAt": 0, "updatedAt": 0, "__v": 0 },
  updateProfile: { "password": 0, "deviceToken": 0, "deviceType": 0, "createdAt": 0, "updatedAt": 0, "__v": 0 },
  createApp: { "__v": 0 },
  getApps: { "__v": 0 },
  getApp: { "__v": 0 },
  updateApp: { "__v": 0 },
  createNews: { "__v": 0 },
  getNews: { "__v": 0 },
  createUser: { "password": 0, "deviceToken": 0, "deviceType": 0, "createdAt": 0, "updatedAt": 0, "__v": 0 },
  getUsers: { "password": 0, "deviceToken": 0, "deviceType": 0, "__v": 0 },
  linkApp: { "__v": 0, "password": 0 },
  getUserAppById: { "__v": 0, "password": 0 },
  getUserApps: { "__v": 0, "password": 0 },
  postReason: { "__v": 0 }
};

module.exports = {
  /* Admin On-Boarding */
  signUp: async (req, res, next) => {
    try {
      if (req.file) {
        req.body.profilePic = config.get("PATHS").IMAGE.ADMIN.STATIC + req.file.filename;
      }
      req.body.password = await universal.hashPasswordUsingBcrypt(req.body.password);
      await validations.admin.validateSignUp(req, "body");
      const isEmailUsed = await Models.Admin.findOne({ email: req.body.email, isDeleted: false }).lean();
      if (isEmailUsed) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.EMAIL_ALREADY_ASSOCIATED_WITH_ANOTHER_ACCOUNT, {}, req.lang);
      }
      const isPhoneUsed = await Models.Admin.findOne({ phone: req.body.phone, countryCode: req.body.countryCode, isDeleted: false }).lean();
      if (isPhoneUsed) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.PHONE_NUMBER_ALREADY_ASSOCIATED_WITH_ANOTHER_ACCOUNT, {}, req.lang);
      }
      let admin = await Models.Admin(req.body).save();
      admin = await Models.Admin.findById(ObjectId(admin.id), Projections.signUp).lean();
      admin.authToken = await universal.jwtSign({ _id: admin._id });
      admin = {
        status: CODES.OK,
        message: MESSAGES.ADMIN_REGISTERED_SUCCESSFULLY,
        data: admin
      };
      return await universal.response(res, admin.status, admin.message, admin.data, req.lang);
    } catch (error) {
      if (req.file) await universal.deleteFiles([config.get("PATHS").IMAGE.ADMIN.ACTUAL + req.file.filename]);
      console.log(error);
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      await validations.admin.validateLogin(req, "body");
      let admin = await Models.Admin.findOne({ email: req.body.email, isDeleted: false }, Projections.login).lean();
      if (!admin) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.ADMIN_NOT_EXIST, {}, req.lang);
      }
      const isPasswordMatched = await universal.comparePasswordUsingBcrypt(req.body.password, admin.password);
      if (!isPasswordMatched) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.PASSWORD_NOT_MATCH, {}, req.lang);
      }
      delete admin.password;
      admin.authToken = await universal.jwtSign({ _id: admin._id });
      admin = {
        status: CODES.OK,
        message: MESSAGES.ADMIN_LOGGED_IN_SUCCESSFULLY,
        data: admin
      };
      return await universal.response(res, admin.status, admin.message, admin.data, req.lang);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  logout: async (req, res, next) => {
    try {
      await Models.Admin.findOneAndUpdate({ _id: ObjectId(req.user._id), isDeleted: false }, { deviceToken: "" }).lean();
      let admin = {
        status: CODES.OK,
        message: MESSAGES.ADMIN_LOGGED_OUT_SUCCESSFULLY,
        data: {}
      };
      return await universal.response(res, admin.status, admin.message, admin.data, req.lang);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getProfile: async (req, res, next) => {
    try {
      let admin = await Models.Admin.findOne({ _id: ObjectId(req.user._id), isDeleted: false }, Projections.getProfile).lean();
      admin = {
        status: CODES.OK,
        message: MESSAGES.PROFILE_FETCHED_SUCCESSFULLY,
        data: admin
      };
      return await universal.response(res, admin.status, admin.message, admin.data, req.lang);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  updateProfile: async (req, res, next) => {
    try {
      if (req.file) {
        req.body.profilePic = config.get("PATHS").IMAGE.ADMIN.STATIC + req.file.filename;
      }
      await validations.admin.validateUpdateProfile(req, "body");
      let admin = await Models.Admin.findOneAndUpdate({ _id: ObjectId(req.user._id), isDeleted: false }, req.body);
      admin = await Models.Admin.findOne({ _id: ObjectId(req.user._id), isDeleted: false }, Projections.updateProfile).lean();
      admin = {
        status: CODES.OK,
        message: MESSAGES.PROFILE_UPDATED_SUCCESSFULLY,
        data: admin
      };
      return await universal.response(res, admin.status, admin.message, admin.data, req.lang);
    } catch (error) {
      if (req.file) await universal.deleteFiles([config.get("PATHS").IMAGE.ADMIN.ACTUAL + req.file.filename]);
      console.log(error);
      next(error);
    }
  },
  changePassword: async (req, res, next) => {
    try {
      await validations.admin.validateChangePassword(req, "body");
      const oldPasswordValid = await universal.comparePasswordUsingBcrypt(req.body.oldPassword, req.user.password);
      if (!oldPasswordValid) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.OLD_PASSWORD_IS_INCORRECT, {}, req.lang);
      }
      const newPassword = await universal.hashPasswordUsingBcrypt(req.body.newPassword);
      await Models.Admin.findOneAndUpdate({ _id: ObjectId(req.user._id), isDeleted: false }, { password: newPassword });
      return await universal.response(res, CODES.OK, MESSAGES.PASSWORD_CHANGE_SUCCESSFULLY, {}, req.lang);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      await validations.admin.validateForgotPassword(req, "body");
      let admin = await Models.Admin.findOne({ email: req.body.email, isDeleted: false }).lean();
      if (!admin) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.ADMIN_NOT_EXIST, {}, req.lang);
      }
      const OTP = {
        code: "0000",
        email: admin.email,
        phone: admin.phone,
        countryCode: admin.countryCode,
        type: "PASSWORD",
        expireAt: moment().add(3, 'minutes')
      }
      const OTP_SENT = await Models.Otp.findOne({
        code: "0000",
        email: admin.email,
        phone: admin.phone,
        countryCode: admin.countryCode,
        type: "PASSWORD",
      }).lean();
      if (OTP_SENT && (moment(OTP_SENT.expireAt) >= moment())) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.OTP_ALREADY_SENT_TO_PROVIDED_EMAIL, {}, req.lang);
      }
      await Models.Otp(OTP).save();
      return await universal.response(res, CODES.OK, MESSAGES.OTP_SENT_SUCCESSFULLY, {}, req.lang);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      await validations.admin.validateResetPassword(req, "body");
      const { email, code } = req.body;
      const OTP = await Models.Otp.findOne({ email, code, type: "PASSWORD" }).lean();
      if (!OTP) {
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.INCORRECT_OTP, {}, req.lang);
      }
      if (moment(OTP.expireAt) <= moment()) {
        await Models.Otp.findOneAndDelete({ _id: ObjectId(OTP._id) });
        return await universal.response(res, CODES.BAD_REQUEST, MESSAGES.OTP_EXPIRED, {}, req.lang);
      }
      const newPassword = await universal.hashPasswordUsingBcrypt(req.body.password);
      await Models.Admin.findOneAndUpdate({ email: req.body.email, isDeleted: false }, { password: newPassword });
      await Models.Otp.findOneAndDelete({ _id: ObjectId(OTP._id) });
      return await universal.response(res, CODES.OK, MESSAGES.PASSWORD_RESET_SUCCESSFULLY, {}, req.lang);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  createClub: async(req, res, next) => {
    try {
      await validations.admin.validateCreateClub(req, "body");
      
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
};
