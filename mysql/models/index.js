const Sequelize = require('sequelize');
const User = require('./user');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];                                              // 데이터 베이스 설정을 불러옴
const sequelize = new Sequelize(config.database, config.username, config.password, config);   // MySQL 연결 객체 생성

const db = {};
db.sequelize = sequelize;           // app.js에서 sequelize.sync메서드 실행-> db연결
db.User = User;                     // associate에 db를 넘겨줄때 모델간의 관계 설정해줄때 사용할 수 있게 넣어줌

User.init(sequelize);
User.associate(db);

module.exports = db;