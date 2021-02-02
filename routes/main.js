const express = require('express');
const { isLoggedIn } = require('./middleware');
const User = require('../mysql/models/user');
const multer = require('multer');
const path = require('path');
const RoomInfo = require('../mongoDB/schemas/roomInfo');
const ChatContent = require('../mongoDB/schemas/chatContent');
const UserChatRoom = require('../mongoDB/schemas/userChatRoom');
const {Op}= require("sequelize");


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

router.route('/newFriend', isLoggedIn)
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

            const { roomID: rooms } = await UserChatRoom.findOne({ userID: req.user.id }).populate('roomID');

            res.render('chat.html', { rooms })
        } catch (error) {
            console.log(error);
            next(error)
        }
    })

router.route('/chat/:roomID', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            const roomID = req.params.roomID;
            const userID = req.user.id;

            const room = await RoomInfo.findOne({_id:roomID});

            const chats = await ChatContent
                .find({ roomID })
                .sort({ createdAt: 'descending' })
                .populate('roomID');

            const userList = await User.findAll({
                where: {
                    id: {
                        [Op.in]: chats[0].roomID.memberID
                    }
                }
            });

            const users = {}
            for(user of userList){
                users[user.id] = user
            }

            return res.render('chatRoom.html', { room, chats, users });
        } catch (error) {
            console.log(error);
            next(error)
        }
    })

router.route('/newChat', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            const friends = await User.findAll({});
            if (!friends) return res.send('Server Error');

            res.render('newChat.html', { friends })
        } catch (error) {
            console.log(error);
            next(error)
        }
    })
    .post(upload.single('roomImage'), async (req, res, next) => {
        try {
            const { filename: roomImage } = req.file
            const { roomName } = req.body
            delete req.body.roomName

            const room = await RoomInfo.create({
                roomName,
                roomImage,
                memberID: Object.keys(req.body),
            });

            const rooms = await UserChatRoom.find({ userID: req.user.id });
            if (!rooms.n) {
                await UserChatRoom.create({
                    userID: req.user.id,
                    roomID: [room._id],
                });
            } else {
                await UserChatRoom.updateOne({
                    userID: req.user.id,
                }, {
                    $push: { roomID: room }
                });
            }
            res.end()
        } catch (error) {
            console.log(error);
            next(error)
        }
    })

module.exports = router;