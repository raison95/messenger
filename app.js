const express = require('express');
const session = require('express-session');
const nunjucks = require('nunjucks');
const indexRouter = require('./routes');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoDBConnect = require('./models');
const redis = require('redis');
const passport = require('passport');
const passportConfig = require('./passport');
const RedisStore = require('connect-redis')(session);
const SocketIO = require('socket.io');
const sharedSessionMW = require("express-socket.io-session");
const User = require('./models/user');

const app = express();

dotenv.config();
nunjucks.configure('views', {
    express: app,
    watch: true,
});
mongoDBConnect();
passportConfig();
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD
});
const sessionMW = session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
    store: new RedisStore({client:redisClient}),
  })

app.set('port', process.env.PORT || 8000);
app.set('view engine', 'html');

                                                    // express.json과 express.urlencoded 둘다 요청의 본문에 있는 데이터를 해석해서 req.body 객체로 만들어줌. 주로 form 데이터나 AJAX 요청의 데이터.multipart 데이터는 multer를 이용해 해석. 이외의 raw,text 형식의 데이터는 body-parser 설치후 사용.
app.use(express.json());                            // appplication/json을 파싱.
app.use(express.urlencoded({extended:false}));      // appplication/x-www-from-urlencoded 파싱. 폼 전송은 urlextended가 false면 querystring 모듈 사용하여 쿼리스트링 해석하고 true면 qs 모듈 사용하여 쿼리스트링 해석.
app.use(morgan('dev'));
app.use(sessionMW);
app.use(passport.initialize());                     // req 객체에 passport 설정을 심음
app.use(passport.session());                        // deserialize를 호출하여 req.session 객체에 passport 정보를 저장

app.use(indexRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

const server = app.listen(app.get('port'), () => {
    console.log("listen at PORT :", app.get('port'));
});

// socket.io
const io = SocketIO(server);

io.use(sharedSessionMW(sessionMW));

io.on('connection', async(socket)=>{
  const userID = socket.handshake.session.passport.user
  const url = socket.request.headers.referer;
  const roomID = url.split('/')[url.split('/').length-1]
  
  const {name: userName} = await User
    .findOne({ _id: userID })
    .select('name');

  socket.join(roomID);

  io.to(roomID).emit('Join',userName);
})

app.set('io',io);