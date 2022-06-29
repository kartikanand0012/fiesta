const multer = require('multer')
const path = require('path')
const config = require('config')

const AdminProfilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let paths = path.resolve(__dirname, '../..' + config.get('PATHS').IMAGE.ADMIN.ACTUAL);
        cb(null, paths)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});
const AdminProfilePicUpload = multer({
    storage: AdminProfilePicStorage, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

const AppIconStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let paths = path.resolve(__dirname, '../..' + config.get('PATHS').IMAGE.APP.ACTUAL);
        cb(null, paths)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});
const AppIconUpload = multer({
    storage: AppIconStorage, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

const NewsIconStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let paths = path.resolve(__dirname, '../..' + config.get('PATHS').IMAGE.NEWS.ACTUAL);
        cb(null, paths)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});
const NewsIconUpload = multer({
    storage: NewsIconStorage, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

const CustomerProfilePicStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        let paths = path.resolve(__dirname, '../..' + config.get('PATHS').IMAGE.USER.ACTUAL);
        cb(null, paths)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
    }
});
const CustomerProfilePicUpload = multer({
    storage: CustomerProfilePicStorage, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
})

module.exports = {
    AdminProfilePicUpload,
    AppIconUpload,
    NewsIconUpload,
    CustomerProfilePicUpload
};