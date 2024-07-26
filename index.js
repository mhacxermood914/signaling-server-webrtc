require('dotenv').config()

const express = require('express');
const cors = require('cors');

const PORT = 3000;

const app = express();
const socketIo = require('socket.io')
const server = app.listen(process.env.PORT, '0.0.0.0')


const io = socketIo(server);

let socketToRoom= {}
let rooms = {};
io.on("connection", socket => {
    socket.on("join", data => {

        const roomId = data.room

        socket.join(roomId);

        socketToRoom[socket.id] = roomId;

        if (rooms[roomId]) {

            rooms[roomId].push({id: socket.id, name: data.name});

        } else {

            rooms[roomId] = [{id: socket.id, name: data.name}];

        }

        const new_user = rooms[data.room].pop() 

        socket.broadcast.emit("memberJoined", new_user)

    });

    socket.on("offer", data => {

        socket.broadcast.emit("getOffer", {
            offer: data.offer,
            memberId: data.name
        });

        console.log("get offer: " + socket.id);

    });



    socket.on("answer", data => {

        socket.broadcast.emit("getAnswer", {
            answer: data.answer,
            memberId: data.name
        });

        console.log("answer: " + socket.id);

    });



    socket.on("candidate", candidate => {

        socket.broadcast.emit("getCandidate", candidate);

        console.log("candidate: " + socket.id);

    });

    socket.on("disconnect", () => {

        const roomId = socketToRoom[socket.id];

        let room = rooms[roomId];

        if (room) {

            room = room.filter(user => user.id !== socket.id);

            rooms[roomId] = room;

        }

        socket.broadcast.to(room).emit("user_exit", {id: socket.id});

        console.log(`[${socketToRoom[socket.id]}]: ${socket.id} exit`);

    });


})
const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {

    res.send('hello, word!');

})
