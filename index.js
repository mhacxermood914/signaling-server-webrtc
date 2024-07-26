require('dotenv').config()

const express = require('express');
const cors = require('cors');

const PORT = 3000;

const app = express();
const socketIo = require('socket.io')
const server = app.listen(process.env.PORT | PORT, () => {
    console.log(`server is running on http://localhost:${process.env.PORT ||PORT}`)
})


const io = socketIo(server);

let socketToRoom= {}
let rooms = {};
io.on("connection", socket => {
    socket.on("join", data => {

        // let a new user join to the room

        const roomId = data.room

        socket.join(roomId);

        socketToRoom[socket.id] = roomId;



        // persist the new user in the room

        if (rooms[roomId]) {

            rooms[roomId].push({id: socket.id, name: data.name});

        } else {

            rooms[roomId] = [{id: socket.id, name: data.name}];

        }



        // sends a list of joined users to a new user

        const new_user = rooms[data.room].pop() //.filter(user => user.id !== socket.id);

        console.log('socketid',socket.id)

        // if(rooms[data.room].length == 1){
        //     socket.emit("memberJoined", new_user)
        // }else{
            socket.broadcast.emit("memberJoined", new_user)
        // }
        // socket.emit("memberJoined", new_user)


        // io.sockets.to(socket.id).emit("room_users", users);

        // console.log("[joined] room:" + data.room + " name: " + data.name);

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






// app.listen(PORT, () => {
//     console.log(`Listening on port: ${PORT}`);
// });