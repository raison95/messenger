const express = require('express');
const path = require('path')

const router = express.Router();

router.get('/userProfileImage/:id', (req, res) => {
    res.sendFile(path.join(__dirname, "../uploads/userProfileImage", encodeURIComponent(req.params.id)))
});

router.get('/userBackgroundImage/:id', (req, res) => {
    res.sendFile(`../uploads/userBackgroundImage/${encodeURIComponent(req.params.id)}`)
});

module.exports = router;