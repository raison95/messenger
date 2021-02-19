const express = require('express');
const multer = require('multer');
const { isLoggedIn } = require('../middleware');
const User = require('../../models/user');

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {                                                  // 어디에 저장할지. req는 요청 객체, file는 업로드한 파일에 대한정보, done은 콜백
            done(null, 'uploads/');                                    // 첫번째 인수는 에러, 두번째 인수는 저장될 경로. 저장될 경로의 폴더가 이미 존재해야한다.
        },
        filename(req, file, done) {                                                     // 어떤 이름으로 저장할지. req는 요청 객체, file는 업로드한 파일에 대한정보, done은 콜백
            const ext = path.extname(file.originalname);
            done(null, encodeURIComponent(path.basename(file.originalname, ext) + Date.now() + ext));       // 첫번째 인수는 에러, 두번째 인수는 저장될 파일 이름
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },                                             // 파일사이즈 제한
});


const router = express.Router();

router.route('/:id', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            const user = await User
                .findOne({ _id :req.params.id })
                .select('profileImage backgroundImage _id name')
            console.log(user)
            res.render('profile.html', { user });
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

router.route('/edit/:id', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            const user = await User.findOne({ _id :req.params.id });
            res.render('profileEdit.html', { user });
        } catch (error) {
            console.log(error)
            next(error)
        }
    })
    .post(upload.fields([{ name: 'profileImage' }, { name: 'backgroundImage' }]), async (req, res, next) => {
        const id = parseInt(req.params.id)

        const { filename: profileImage } = req.files.profileImage[0]
        const { filename: backgroundImage } = req.files.backgroundImage[0]
        const { name, profileMessage } = req.body

        try {
            const user = await User.update({ name, profileMessage, profileImage, backgroundImage }, { where: { id } });
            if (!user) return res.send('Server Error');
            res.render('profileEdit.html', { user });
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

module.exports = router;