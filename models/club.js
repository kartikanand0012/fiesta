const config = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const ClubModel = new Schema({
    code: {
        type: String,
        required: true
    },
    doe: {
        type: Date,
        required: false
    },
    profilePic: {
        type: String,
        default: `${config.get('PATHS').IMAGE.ADMIN.STATIC}default.png`
    },
    gallery: [{
        type: String
    }],
    website: {
        type: String,
        default: ''
    },
    name: {
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
    phoneNumbers: [{
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        countryCode: {
            type: String,
            trim: true,
            default: ''
        }
    }],
    address: {
        type: String,
        default: ''
    },
    lat: {
        type: String,
        default: ''
    },
    long: {
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
    status: {
        type: String,
        enum: ['ACTIVE', 'PENDING', 'COMPLETED'],
        default: 'ACTIVE'
    },
    isEmailVerify: {
        type: Boolean,
        default: false
    },
    isPhoneVerify: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: ObjectId,
        required: true,
        ref: 'admins'
    },
    updatedBy: {
        type: ObjectId,
        required: true,
        ref: 'admins'
    }
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const Club = mongoose.model('Club', ClubModel);
module.exports = Club;