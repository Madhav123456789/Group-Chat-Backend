const express = require('express');
const http = require('http');
const cors = require('cors');
const socket = require('socket.io');
const app = express();

// creatig http server
const server = http.createServer(app);

// creating connection between socket and server
const io = socket(server);

const PORT = process.env.PORT||8000;
// middlewares
// app.use(cors({
//     origin:" https://my-group-chat.herokuapp.com"
// }));

app.use(cors({
    origin:" http://localhost:3000"
}));

// default api
app.get("/" , (req , res)=>{
    res.json({
        "Name" : "Alexaa"
    })
});

const users = new Map();
// using io
io.on("connection" , (socket)=>{
    console.log("New Connection");
    console.log("loop?");

    socket.on("join" , ({name})=>{
        users.set(socket.id , name);
        // broadcasting
        socket.broadcast.emit("user-joined" , {user:"Admin" , msg:`${users.get(socket.id)} has joined the chat`});  
        // sending to the new joined user    
        socket.emit("welcome" , {user:"Admin" , msg:"Welcome to the chat"});

        console.log(users);
    });

    // when user disconnect
    socket.on("discon" , ()=>{
            // broadcasting to all that user disconnected
            socket.broadcast.emit("leaved-user" , {msg:`${users.get(socket.id)} has leaved the chat`});
            users.delete(socket.id);
            console.log(users);
    });

    socket.on("send-message",(data)=>{
        // broadcasting msg
        io.emit("receive-msg" , {name:users.get(socket.id) , msg:data.msg , id:data.id});
    });

});

server.listen(PORT , (err)=>{
    if(err){
        console.log(err);
        return;
    }

    console.log("http://127.0.0.1:"+PORT);
})