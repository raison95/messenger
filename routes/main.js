const express = require('express');
const { isLoggedIn } = require('./middleware');
const User = require('../mysql/models/user');
const multer = require('multer');
const path = require('path');
const RoomInfo = require('../mongoDB/schemas/roomInfo');
const ChatContent = require('../mongoDB/schemas/chatContent');
const UserChatRoom = require('../mongoDB/schemas/userChatRoom');


const router = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {                                                  // 어디에 저장할지. req는 요청 객체, file는 업로드한 파일에 대한정보, done은 콜백
            done(null, 'uploads/userProfileImage/');                                    // 첫번째 인수는 에러, 두번째 인수는 저장될 경로. 저장될 경로의 폴더가 이미 존재해야한다.
        },
        filename(req, file, done) {                                                     // 어떤 이름으로 저장할지. req는 요청 객체, file는 업로드한 파일에 대한정보, done은 콜백
            const ext = path.extname(file.originalname);
            done(null, encodeURIComponent(path.basename(file.originalname, ext) + Date.now() + ext));       // 첫번째 인수는 에러, 두번째 인수는 저장될 파일 이름
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },                                             // 파일사이즈 제한
});


router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.send('Server Error');
        return res.render('layout.html', { user });
    } catch (error) {
        console.log(error);
        next(error)
    }
});

router.route('/profile/:id', isLoggedIn)
    .get(async (req, res, next) => {
        const id = parseInt(req.params.id)
        try {
            const user = await User.findOne({ where: { id } });
            if (!user) return res.send('Server Error');
            res.render('profile.html', { user });
        } catch (error) {
            console.log(error)
            next(error)
        }
    })

router.route('/profile/edit/:id', isLoggedIn)
    .get(async (req, res, next) => {
        const id = parseInt(req.params.id)
        try {
            const user = await User.findOne({ where: { id } });
            if (!user) return res.send('Server Error');
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

router.route('/friend', isLoggedIn)
    .get((req, res, next) => {
        res.render('newFriend.html');
    })
    .post(async (req, res, next) => {
        const emailToFind = req.body.email
        try {
            const user = await User.findOne({ where: { email: emailToFind } });
            if (!user) return res.send(`${emailToFind}를 찾을 수 없습니다. 다시 입력해 주세요.`);
            res.render('newFriend.html', { user })
        } catch (error) {
            console.log(error)
            next(error);
        }
    })

router.route('/chat', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            const user = await User.findOne({ where: { id: req.user.id } });
            if (!user) return res.send('Server Error');

            const rooms = await UserChatRoom.find({ userID: req.user.id });
            console.log(rooms)
            // return res.render('layout.html', { user });
        } catch (error) {
            console.log(error);
            next(error)
        }
    })
    .post(async (req, res, next) => {
        try {
            const room = await RoomInfo.create(
                {roomName},
                {roomImage},
                { '$push': { 'memberID': req.user.id }, },
            )
            console.log(room)
            // UserChatRoom.create(
            //     { userID: req.user.id },
            //     { '$push': { 'roomID': 'OS' }, },
            // )
            // const rooms = await UserChatRoom.find({ userID: req.user.id });
            // console.log(rooms)
            // return res.render('layout.html', { user });
        } catch (error) {
    console.log(error);
    next(error)
}
    })

router.route('/chat/:roomId', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user) return res.send('Server Error');
        return res.render('layout.html', { user });
    } catch (error) {
        console.log(error);
        next(error)
    }
})

module.exports = router;