// const SocketIO = require('socket.io');

// module.exports = (server) => {
//     const io = SocketIO(server, { path: '/socket.io' });
//     // 옵션 path: 클라이언트가 접속할 경로 설정
//     // 옵션 transports : ['websocket']을 주게 되면 먼저 폴링 방식(xhr)으로 서버와 연결하는게 아니라 바로 웹소켓으로 연결

//     io.on('connection', (socket) => {                             // socket.request는 req 객체, socket.request.res는 res 객체
//         const ip = socket.request.headers['x-forwarded-for']
//             || socket.request.connection.remoteAddress;

//         console.log('새로운 클라이언트 접속!', ip, socket.id, socket.request.ip);

//         socket.on('disconnect', () => {
//             console.log('클라이언트 접속 해제', ip, socket.id);
//             clearInterval(socket.interval);
//         });

//         socket.on('error', (error) => {
//             console.error(error);
//         });

//         socket.on('reply', (data) => {                              // 사용자 정의 이벤트
//             console.log(data);
//         });

//         socket.interval = setInterval(() => {
//             socket.emit('news', 'Hello Socket.IO');                   // 첫번째 인수 이벤트 명, 두번째 인수 데이터
//         }, 3000);

//     });
// };