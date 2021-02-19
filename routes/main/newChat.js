const express = require('express');
const multer = require('multer');
const path = require('path');
const { isLoggedIn } = require('../middleware');
const UserRelation = require('../../models/userRelation');
const RoomInfo = require('../../models/roomInfo');
const UserChatRoom = require('../../models/userChatRoom');

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
            const {followeeID:friends} = await UserRelation
                .findOne({followerID: req.user.id})
                .populate('followeeID','name profileImage profileMessage');

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

            const memberList = [req.user.id]
            Object.keys(req.body).map((key) => {
                if (key.startsWith('friend_id_')) {
                    memberList.push(key.substring(10))
                }
            })

            const room = await RoomInfo.create({
                roomName,
                roomImage,
                memberID: memberList,
            });

            memberList.forEach(async (member) => {
                const rooms = await UserChatRoom.findOne({ userID: member });
                if (!rooms) {
                    await UserChatRoom.create({userID: member, roomID: [room._id],});
                } else {
                    await UserChatRoom.updateOne({userID: member}, {$push: { roomID: room._id }});
                }
            })

            res.send('채팅방이 생성되었습니다.')
        } catch (error) {
            console.log(error);
            next(error)
        }
    })

module.exports = router;