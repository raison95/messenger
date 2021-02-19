const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomInfoSchema = new Schema({
    roomName: {
        type: String,
    },
    roomImage:{
        type: String
    },
    memberID:{
        type:[String],
        require: true,
    },
},{versionKey:false});

module.exports=mongoose.model('RoomInfo',roomInfoSchema);