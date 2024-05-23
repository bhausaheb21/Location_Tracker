const { Server } = require('socket.io');
const { getPayload } = require('../utils/AuthUtils');
const User = require('../Models/User');

const userToSOcket = new Map()

module.exports = (io) => {
    io.use((socket, next) => {
        try {
            const header = socket.handshake.headers.auth;
            console.log(header);

            const token = header.split(" ")[1];
            if (!token) {
                const error = new Error("Not Authorized")
                error.status = 401;
                throw error;
            }
            const payload = getPayload(token);

            if (payload.verified) {
                socket.user = { ...payload };
                next()
            }
            else {
                throw new Error("Not verified")
            }
        }
        catch (err) {
            next(err);
        }
    })


    io.on('connection', async (socket) => {
        const user = await User.findById(socket.user.id);
        let room = user.room;
        socket.join(user.room);
        socket.emit("Room Name", { status: "Connected", room: room });
        userToSOcket.set(socket.id, { id: user._id.toString(), email: user.email, name: user.name })
        console.log(userToSOcket);

        socket.on("new_location", (data) => {
            const payload = { ...data, ...userToSOcket.get(socket.id) }
            socket.broadcast.to(room).emit("new_location", payload)
        })

        socket.on('join_room', async ({ room_name }) => {
            const user =await User.findById(userToSOcket[socket.id].id);
            socket.leave(user.room);
            socket.join(room_name);
            user.room = room_name;
            console.log("joined Success ", room_name);
            room = room_name;
            await user.save();
            socket.emit('join',"Joined Successfully")
        })

        socket.on("disconnect", () => {
            console.log("Disconnected");
            userToSOcket.delete(socket.id)
            console.log(userToSOcket);
        })

    });




}   