const express = require('express');
const path = require('path')

const router = express.Router();

router.get('/:id', (req, res) => {
    res.sendFile(path.join(__dirname, "../uploads", encodeURIComponent(req.params.id)))
});

module.exports = router;