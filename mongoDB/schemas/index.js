const mongoose = require('mongoose');

const mongoDBConnect = () =>{
    if(process.env.NODE_ENV !== 'production'){
        mongoose.set('debug',true);
    }

    mongoose.connect(`mongodb://${process.env.MONGO_ID}:${process.env.MONGO_PASSWORD}@localhost:27017/admin`,{
        dbName: 'chat',
        useNewUrlParser: true,
        useCreateIndex: true,
    },(error)=>{
        if(error) console.log('mongoDB 연결 에러1',error);
        else console.log('mongoDB 연결 성공');
    })

    mongoose.connection.on('error',(error)=>{
        console.error('mongoDB 연결 에러2',error)
    })

    mongoose.connection.on('disconnected',()=>{
        console.error('mongoDB 연결이 종료되었습니다. 다시 연결 합니다...');
        mongoDBConnect();
    })
}

module.exports=mongoDBConnect;