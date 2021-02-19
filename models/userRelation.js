const mongoose = require('mongoose');
const { Schema } = mongoose;

const userRelationSchema = new Schema({
    followerID:{
        type:Schema.Types.ObjectId,
        require: true,
        unique : true,
        ref: 'User'
    },
    followeeID:[{
        type:Schema.Types.ObjectId,
        ref: 'User',
    }]
},{versionKey:false});

module.exports = mongoose.model('UserRelation', userRelationSchema);