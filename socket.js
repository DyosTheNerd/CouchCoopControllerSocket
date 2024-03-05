module.exports = server => {
    const io = require("socket.io")(server, {
        cors: {origin: ["https://make-me-laugh-jam-controller.vercel.app/"]}
    });

    const players = {}
    io.on("connection", socket => {
        socket.on('startServer', (msg) => {
                const serverData = JSON.parse(msg)
                players[serverData.id] = {}
                socket.join(`game-${serverData.id}-server`)
                socket.onAny((topic, msg) => {
                    const topicParts = topic.split('-')
                    if (topicParts.length > 1) {
                        const playerId = topicParts[topicParts.length - 1]
                        socket.to(`game-${serverData.id}-${playerId}`).emit(topicParts[0], msg)
                    } else {
                        socket.to(`game-${serverData.id}-client`).emit(topic, msg)
                    }
                })
            }
        )

        socket.on('startClient', (msg) => {

            const playerData = JSON.parse(msg);

            const lobby = players[playerData.id];
            if (!lobby) {
                socket.emit('error', 'No game found');
                return;
            }
            socket.join(`game-${playerData.id}-client`);
            socket.join(`game-${playerData.id}-${playerData.playerId}`);
            socket.onAny((topic, msg) => {
                socket.to(`game-${playerData.id}-server`).emit(topic, msg)
            });
            lobby[playerData['playerId']]= playerData.name;
            const lobbyList = [];
            lobby.forEach((name, id) => {
                lobbyList.push({name, id});
            })

            socket.to(`game-${playerData.id}-server`).emit('playerJoined', JSON.stringify({players: lobbyList}));

        })

    });
};