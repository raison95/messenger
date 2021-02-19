const passport = require('passport');
const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user._id);                        // 세션에 저장할 정보. 이제 req.session에 해당값이 저장된다.
    });

    passport.deserializeUser((_id, done) => {        // passport.session 미들웨어가 호출
        User.findOne({ _id })
            .then(user => done(null, user))         // 이제 req.user 사용이 가능하다.
            .catch(err => done(err));
    })

    local();
}