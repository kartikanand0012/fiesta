const Messages = require('../langs')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const fs = require("fs");
const path = require("path");
const ffmpeg = require('fluent-ffmpeg')
const { Parser } = require('json2csv');
module.exports = {
    /*
    Response Functions
    */
    errMessage: async (res, status, message, lang) => { await res.status(status).send({ status: status, message: Messages[lang][message] }); },
    sucMessage: async (res, status, message, data, lang) => { await res.send({ status: status, message: Messages[lang][message], result: data }); },
    response: async (res, status, message, data, lang) => {
        if (status != 200) {
            console.log(status, message, data, lang)
            await res.status(status).send({ status: status, message: Messages[lang][message], result: data });
        }
        else {

            await res.status(status).send({ status: status, message: Messages[lang][message], result: data });
        }
    },
    /*
    Bcrypt Functions
    */
    hashPasswordUsingBcrypt: async (password) => { return bcrypt.hashSync(password, 10); },
    comparePasswordUsingBcrypt: async (pass, hash) => { return bcrypt.compareSync(pass, hash) },
    /*
    JWT Functions
    */
    jwtSign: async (payload) => {
        try {
            return jwt.sign(
                { _id: payload._id },
                config.get("JWT_OPTIONS").SECRET_KEY,
                {
                    expiresIn: config.get("JWT_OPTIONS").EXPIRES_IN
                }
            );
        } catch (error) {
            throw error;
        }
    },
    jwtVerify: async (token) => {
        try {
            return await jwt.verify(token, config.get("JWT_OPTIONS").SECRET_KEY);
        } catch (error) {
            throw error;
        }
    },
    /*
    Generate Thumbnail Functions
    */
    generateVideoThumbnail: async (paths, saveLocation) => {
        try {
            ffmpeg(paths)
                .screenshots({
                    filename: paths.split('/')[paths.split('/').length - 1] + "_thumbnail.png",
                    folder: path.join(__dirname, saveLocation),
                    count: 1
                }).on('error', (e) => {
                    console.log({ e })
                    return false
                })
                .on('end', async () => {
                    return true
                })
        } catch (error) {
            throw error;
        }
    },
    /*
    File Functions
    */
    deleteFiles: async (paths) => {
        await paths.forEach(filePath => fs.unlinkSync(path.resolve(__dirname, '..' + filePath)))
        return
    },
    /*
    Email Service
    */
    emailService: require('./Email'),
    /*
    Otp
    */
    generateOtp: async () => {
        try {
            var digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 4; i++) { OTP += digits[Math.floor(Math.random() * 10)]; }
            return OTP;
        } catch (error) {
            throw error;
        }
    },
    getStatus: (statusString) => {
        const status = {
            "NOT ACCEPTED": 0,
            "ACCEPTED": 1,
            "LOADED": 2,
            "DISPATCHED": 3,
            "ARRIVED": 4,
            "DELIVERED": 5,
            "REJECTED": 6
        }
        console.log({ status: status[statusString] });
        return status[statusString]
    }
}