const express = require('express');
const passport = require('passport');

const router = express.Router();

router.post('/local', async (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {         // authenticate가 localStrategy.js의 LocalStrategy 호출
        if (authError) {
            console.log(authError);
            return next(authError);
        }
        if (!user) return res.send(`${info.message}`);
        req.login(user, (loginError) => {                               //  login이 index.js의 Serialize 호출
            if (loginError) {
                console.log(loginError)
                return next(loginError);
            }
            res.redirect('/main');
        })
    })(req, res, next);
});

module.exports = router;