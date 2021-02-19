const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatContentSchema = new Schema({
    roomID:{
        type: Schema.Types.ObjectId,
        require: true,
        ref: 'RoomInfo',
    },
    userID:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message:{
        type: String,
    },
    file:{
        type: String,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },    
},{versionKey:false});


module.exports=mongoose.model('ChatContent',chatContentSchema);