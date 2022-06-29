const express = require('express');
const Routes = require('./routes/');
const router = express();
router.use('/admin', Routes.admin);
module.exports = router;