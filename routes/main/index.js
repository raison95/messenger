const express = require('express');
const { isLoggedIn } = require('../middleware');
const User = require('../../models/user');
const UserRelation = require('../../models/userRelation');
const chatRouter = require('./chat');
const profileRouter = require('./profile');
const newChatRouter = require('./newChat');
const newFriendRouter = require('./newFriend');

const router = express.Router();

router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        const user = await User
            .findOne({ _id: req.user.id })
            .select('name profileImage profileMessage userFriends')
            .populate('userFriends');

        if(user.userFriends){
            const {followeeID: friends}=  await UserRelation
                .findOne({ followerID: req.user.id })
                .populate('followeeID','name profileImage profileMessage')
            return res.render('main.html', { user, friends });
        }

        res.render('main.html', { user });
    } catch (error) {
        console.log(error);
        next(error)
    }
});

router.use('/chat', chatRouter);
router.use('/profile', profileRouter);
router.use('/newChat', newChatRouter);
router.use('/newFriend', newFriendRouter);

module.exports = router;