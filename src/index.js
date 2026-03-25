    const express = require('express');
    const http = require('http');
    const socketIo = require('socket.io');
    const path = require('path');

    const mongoose = require('mongoose');

    const app = express();
    const server = http.createServer(app);
    const io = socketIo(server);

    const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/chat-database'
    
    
    mongoose.connect(dbURI)
        .then(db => console.log('base de datos conectada'))
        .catch(err => console.log('Error en DB:', err));

    app.use(express.static(path.join(__dirname, 'public')));

    require('./sockets')(io);

    app.set('port', process.env.PORT || 3000);

    server.listen(app.get('port'),'0.0.0.0', () => {
        console.log('Servidor corriendo en el puerto', app.get('port'));
    });