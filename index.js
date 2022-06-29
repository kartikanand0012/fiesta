/* 
Import Required Modules
*/
const config = require('config');
const express = require("express");
// const redis = require('redis');
const morgan = require('morgan')
const app = express();
const mongoose = require('mongoose')
const cors = require("cors");
app.use(cors());
/*
Add SSL Certificate
*/
const fs = require("fs");
let options = {}
if (process.env.NODE_ENV == "live") {
    options = {
        key: fs.readFileSync("/etc/letsencrypt/live/appgrowthcompany.com/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/appgrowthcompany.com/fullchain.pem")
    }
}
/*
Initialize Server
*/
let server = ""
if (process.env.NODE_ENV == "live") {
    server = require("https").createServer(options, app);
}
else {
    server = require("http").createServer(app);
}
/* 
Socket Initialization
*/
const { io } = require("./utils/Sockets");
io.attach(server);

server.listen(config.get('PORT'), () => {
    console.log(`****************************************** ${'ENVIRONMENT:::' + process.env.NODE_ENV} *******************************************************`);
    console.log(`****************************************** ${'PORT:::' + config.get('PORT')} *******************************************************`);
})
/*
Database Connection
*/
mongoose.connect(config.get('DB_URL'), { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }).then(
    (db) => console.log(`****************************************** MONGODB CONNECTED ***********************************************`),
    (err) => console.log("MongoDB " + String(err.message))
);
/*
Redis Connection
*/
// global.REDIS_CLIENT = redis.createClient(config.get('REDIS.PORT'), config.get('REDIS.HOST'));
// REDIS_CLIENT.on('connect', function () { console.log(`****************************************** ${'REDIS PORT:::' + config.get('REDIS.PORT')} *******************************************************`); });
/* 
View Engine Setup
*/
app.set("view engine", "ejs");
/*
Middelwares
*/
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
/*
Serving Static Files
*/
app.use(config.get('PATHS').IMAGE.ADMIN.STATIC, express.static(__dirname + config.get('PATHS').IMAGE.ADMIN.ACTUAL));
/*
API Hits
*/
app.use((req, res, next) => {
    console.log("API HIT -----------------> ", req.method, res.statusCode, req.originalUrl || req.url, "\n|\nv\n|\nv\n");
    if (!req.header('lang') || req.header('lang') == '') { req.lang = 'en' }
    else { req.lang = req.header('lang') }
    next();
});
/*
Test API
*/
app.use('/test', async (req, res, next) => {
    res.status(200).send({ status: 200, message: "TEST API" })
});
/*
API Routes
*/
const route = require('./route');
app.use('/api', route)
/*
Catch 404 Error
*/
app.use((req, res, next) => {
    const err = new Error("Invalid Route");
    res.status(404).send({ status: 404, message: err.message });
});
/*
Error Handler
*/
app.use((err, req, res, next) => {
    console.error(err);
    if (err.message == "jwt expired" || err.message == "invalid signature" || err.message == "No Auth") err.status = 401
    const status = err.status || 400;
    if (typeof err == typeof "") { res.status(status).send({ error: false, status: status, message: err.message || err || "", result: err }) }
    else res.status(status).send({ status: status, message: err.message || "", result: { ...err } });
});