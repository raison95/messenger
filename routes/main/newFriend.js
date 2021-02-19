const express = require('express');
const { isLoggedIn } = require('../middleware');
const User = require('../../models/user');
const UserRelation = require('../../models/userRelation');

const router = express.Router();

router.route('/', isLoggedIn)
    .get((req, res, next) => {
        res.render('newFriend.html');
    })
    .post(async (req, res, next) => {
        const emailToFind = req.body.email;
        try {
            const user = await User
                .findOne({ email: emailToFind })
                .select('name profileImage profileMessage');
            
            if (!user) return res.send(`${emailToFind}를 찾을 수 없습니다. 다시 입력해 주세요.`);

            res.render('newFriend.html', { user })
        } catch (error) {
            console.log(error)
            next(error);
        }
    })

router.route('/:id', isLoggedIn)
    .post(async (req, res, next) => {
        try {
            const user = await User
                .findOne({_id: req.user.id })
                .select('name profileImage profileMessage userFriends')
                .populate('userFriends');

            if(!user.userFriends){
                console.log(`${user._id}에 userFriends 항목이 없어 새로 생성합니다.`);
                const userRelation = await UserRelation.create({followerID:req.user.id, followeeID:req.params.id});
            }
            
            const isAlreadyFriend = user.userFriends.followeeID.find(element => element == req.params.id);

            if(isAlreadyFriend==='undefined'){
                await UserRelation
                    .where({_id: user.userFriends._id})
                    .update({ $push: { followeeID: req.params.id } });
                    
                return res.send(`친구로 추가하였습니다.`);
            }else{
                return res.send(`${req.params.id}님은 이미 친구 입니다.`);
            }
        } catch (error) {
            console.log(error)
            next(error);
        }
    })

module.exports = router;