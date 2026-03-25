const Chat = require('./Models/Chat');

module.exports = function(io){

    let users = {};
    let userColors = {};

    const colores = [
        '#1abc9c','#3498db','#9b59b6','#e67e22','#e74c3c',
        '#2ecc71','#f1c40f','#16a085','#2980b9','#8e44ad'
    ];

    function getColor(){
        return colores[Math.floor(Math.random() * colores.length)];
    }

    io.on('connection', async (socket) => {
        console.log('Usuario conectado');

        // CARGAR MENSAJES
        try {
            const messages = await Chat.find({}).sort({ created_at: 1 });
            socket.emit('Cargando viejos mensajes', messages);
        } catch (error) {
            console.log('Error cargando mensajes:', error);
        }

        // LOGIN
        socket.on('nuevo usuario', (data, cb) => {

    console.log("Intento de login:", data);

    if(!data) return cb(false);

    const nickname = data.trim();

    if (nickname.length < 2){
        console.log("Nombre muy corto");
        return cb(false);
    }

    if (users[nickname]){
        console.log("Usuario ya existe");
        return cb(false);
    }

    socket.nickname = nickname;
    users[nickname] = socket;
    userColors[nickname] = getColor();

    console.log("Usuario aceptado:", nickname);

    cb(true); 

    io.emit('notificacion', `${nickname} se ha unido`);
    updateNicknames();
});
        // ENVIAR MENSAJE
        socket.on('enviar mensaje', async (data, cb) => {

            console.log("Mensaje recibido:", data);

            if (!socket.nickname) {
                return cb('Debes ingresar un nombre');
            }

            let msg = data.trim();

            if (!msg){
                return cb('Mensaje vacío');
            }

            // PRIVADO
            if (msg.startsWith('/w ')){
                msg = msg.substring(3);
                const index = msg.indexOf(' ');

                if (index !== -1){
                    const name = msg.substring(0, index);
                    const mensaje = msg.substring(index + 1);

                    if (users[name]){

                        users[name].emit('whisper', {
                            msg: mensaje,
                            nick: socket.nickname,
                            color: userColors[socket.nickname]
                        });

                        socket.emit('whisper', {
                            msg: mensaje,
                            nick: socket.nickname,
                            color: userColors[socket.nickname]
                        });

                    } else {
                        return cb('Usuario no existe');
                    }
                }

            } else {

                // GUARDAR EN DB (pero NO bloquear si falla)
                try {
                    const newMsg = new Chat({
                        nick: socket.nickname,
                        msg: msg
                    });
                    await newMsg.save();
                } catch (error) {
                    console.log("Error guardando:", error);
                }

                //SIEMPRE ENVÍA EL MENSAJE
                io.emit('new-message', {
                    nick: socket.nickname,
                    msg: msg,
                    color: userColors[socket.nickname] || '#000'
                });
            }
        });

        // DESCONECTAR
        socket.on('disconnect', () => {
            if (!socket.nickname) return;

            io.emit('notificacion', `${socket.nickname} salió`);

            delete users[socket.nickname];
            delete userColors[socket.nickname];

            updateNicknames();
        });

        function updateNicknames(){
            io.emit('usernames', Object.keys(users));
        }

    });
};