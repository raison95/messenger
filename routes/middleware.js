exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.send('로그인 필요');
}