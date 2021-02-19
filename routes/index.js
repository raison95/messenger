const express = require('express');
const authRouter = require('./auth');
const mainRouter = require('./main');
const joinRouter = require('./join');
const uploadRouter = require('./upload');

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index.html');
});

router.use('/join', joinRouter);
router.use('/auth', authRouter);
router.use('/main', mainRouter);
router.use('/uploads', uploadRouter);


module.exports = router;