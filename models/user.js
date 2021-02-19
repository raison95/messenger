const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        allowNull: false,
    },
    password: {
        type: String,
        allowNull: false,
    },
    name: {
        type: String,
        allowNull: false,
    },
    profileImage: {
        type: String,
        allowNull: true,
        default: 'defaultProfileImage.jpeg',
    },
    backgroundImage: {
        type: String,
        allowNull: true,
        default: 'defaultBackgroundImage.png',
    },
    profileMessage: {
        type: String,
        allowNull: true,
    },
    userFriends:{
        type: Schema.Types.ObjectId,
        ref: 'UserRelation'
    }
}, { versionKey: false });


module.exports = mongoose.model('User', userSchema);