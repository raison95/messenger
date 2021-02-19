const mongoose = require('mongoose');
const { Schema } = mongoose;

const userChatRoomSchema = new Schema({
    userID:{
        type:Schema.Types.ObjectId,
        require: true,
        unique : true,
        ref: 'User'
    },
    roomID:[{
        type:Schema.Types.ObjectId,
        require: true,
        ref: 'RoomInfo',
    }]
},{versionKey:false});

module.exports=mongoose.model('UserChatRoom',userChatRoomSchema);