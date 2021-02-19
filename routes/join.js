const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.route('/')
    .get((req, res) => {
        res.render('join.html');
    })
    .post(async (req, res, next) => {
        const { email, password, name } = req.body;
        try {
            const user = await User.findOne({ email });
            if (user) return res.send('이미 존재하는 계정 입니다. 다른 이메일을 사용하세요.');

            const passwordHash = await bcrypt.hash(password, 12);
            console.log(passwordHash)

            await User.create({ email, password: passwordHash, name });
            return res.redirect('/');
        } catch (error) {
            console.log(error);
            next(error);
        }
    });

module.exports = router;