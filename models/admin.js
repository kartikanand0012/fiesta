const config = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminModel = new Schema({
    profilePic: {
        type: String,
        default: `${config.get('PATHS').IMAGE.ADMIN.STATIC}default.png`
    },
    firstName: {
        type: String,
        default: "",
        lowercase: true,
        trim: true
    },
    lastName: {
        type: String,
        default: "",
        lowercase: true,
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    countryCode: {
        type: String,
        trim: true,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    deviceType: {
        type: String,
        enum: ['IOS', 'ANDROID', 'WEB']
    },
    deviceToken: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const Admin = mongoose.model('Admin', AdminModel);
module.exports = Admin;