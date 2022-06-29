const config = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const ClubEmplyoeeModel = new Schema({
    clubCode: {
        type: String,
        required: true
    },
    cludbId:{
        type:String,
        required:true,
    },
    profilePic: {
        type: String,
        default: `${config.get('PATHS').IMAGE.EMPLOYEE.STATIC}default.png`
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
    gender:{
        type:String,
        trim:true,
        default:''
    },
    dob:{
        type:Date,
        required:false,
    },
    doj:{
        type:Date,
        required:false,
    },
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
    isOwner: {
        type:Boolean,
        default:false,
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
    },
    deviceType: {
        type: String,
        enum: ['IOS', 'ANDROID', 'WEB']
    },
    deviceToken: {
        type: String,
        default: ''
    },
}, {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});
const ClubEmployee = mongoose.model('ClubEmployee', ClubEmplyoeeModel);
module.exports = ClubEmployee;