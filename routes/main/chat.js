const express = require('express');
const multer = require('multer');
const path = require('path')
const { isLoggedIn } = require('../middleware');
const User = require('../../models/user');
const UserChatRoom = require('../../models/userChatRoom');
const RoomInfo = require('../../models/roomInfo');
const ChatContent = require('../../models/chatContent');

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {                                                                      // 어디에 저장할지. req는 요청 객체, file는 업로드한 파일에 대한정보, done은 콜백
            done(null, 'uploads/');                                                                         // 첫번째 인수는 에러, 두번째 인수는 저장될 경로. 저장될 경로의 폴더가 이미 존재해야한다.
        },
        filename(req, file, done) {                                                                         // 어떤 이름으로 저장할지. req는 요청 객체, file는 업로드한 파일에 대한정보, done은 콜백
            const ext = path.extname(file.originalname);
            done(null, encodeURIComponent(path.basename(file.originalname, ext) + Date.now() + ext));       // 첫번째 인수는 에러, 두번째 인수는 저장될 파일 이름
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },                                                                 // 파일사이즈 제한
})

const router = express.Router();

router.route('/', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            let rooms = await UserChatRoom
                .findOne({ userID: req.user.id })
                .populate('roomID')
                .populate({
                    path: 'roomID.memberID',
                })
                .populate('userID', 'profileImage name')

            if (!rooms || !rooms.roomID.length) {
                res.render('chat.html')
            } else {
                rooms = rooms.roomID
                res.render('chat.html', { rooms })
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    })

router.route('/:roomID', isLoggedIn)
    .get(async (req, res, next) => {
        try {
            const roomID = req.params.roomID;
            const myID = req.user.id;

            const room = await RoomInfo.findOne({ _id: roomID });
            const chats = await ChatContent
                .find({ roomID })
                .sort({ createdAt: 'ascending' })
                .populate('roomID');

            if (!chats.length) {
                res.render('chatRoom.html', { room, myID });
            } else {
                const userList = await User.find({
                    where: {
                        id: {
                            [Op.in]: chats[chats.length - 1].roomID.memberID
                        }
                    }
                });

                const users = {}
                for (user of userList) {
                    users[user.id] = user
                }

                res.render('chatRoom.html', { room, chats, users, myID });
            }
        } catch (error) {
            console.log(error);
            next(error)
        }
    })
    .post(upload.single('messageFile'), async (req, res, next) => {
        try {
            const roomID = req.params.roomID;
            const userID = req.user.id;
            const message = req.body.message;
            const file = req.file;
            const { name: userName, profileImage } = await User
                .findOne({ _id: userID })
                .select('name profileImage');

            const io = req.app.get('io')

            const chatData = { data: { message, file }, userName, profileImage, userID};

            io.to(roomID).emit('Chat', chatData);

            res.status(200).end();
            // await ChatContent.create({ roomID, userID, message, file })

            // const userList = await RoomInfo.findAll({
            //     where: {
            //         id: {
            //             [Op.in]: chats[chats.length - 1].roomID.memberID
            //         }
            //     }
            // });
            // const chats = await ChatContent
            //     .find({ roomID })
            //     .sort({ createdAt: 'ascending' })
            //     .populate('roomID');

            // const room = await RoomInfo.findOne({_id:roomID})
            // const userList = room.memberID
            // const users = {}
            // for (user of userList) {
            //     users[user.id] = user
            // }

            // return res.render('chatRoom.html', { room, chats, users });
        } catch (error) {
            console.log(error);
            next(error)
        }
    })

module.exports = router;