$(function(){

    const socket = io();

    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#chat');

    const $nickForm = $('#nickForm');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');

    const $users = $('#usernames');
    const $contentWrap = $('#contentWrap');
    const $nickWrap = $('#nickWrap');

    let enviando = false;

    // LOGIN
    $nickForm.submit(e => {
    e.preventDefault();

    const nick = $nickname.val().trim();

    console.log("Enviando nick:", nick);

    if(nick.length < 2){
        $nickError.html('<div class="alert alert-danger">Nombre muy corto</div>');
        return;
    }

    socket.emit('nuevo usuario', nick, (data) => {

        console.log("Respuesta servidor:", data);

        if(data === true){
            $nickWrap.hide();
            $contentWrap.show();
        } else {
            $nickError.html('<div class="alert alert-danger">Usuario inválido o ya existe</div>');
        }
    });

    $nickname.val('');
});
    // ENVIAR MENSAJE
    $messageForm.submit(e => {
        e.preventDefault();

        const msg = $messageBox.val().trim();

        if(!msg){
            console.log("Mensaje vacío");
            return;
        }

        console.log("Enviando:", msg);

        socket.emit('enviar mensaje', msg, data => {
            if(data){
                $chat.append(`<p class="error">${data}</p>`);
            }
        });

        $messageBox.val('');
    });

    // MENSAJES NUEVOS
    socket.on('new-message', data => {
        console.log("Mensaje recibido:", data);

        $chat.append(`
            <p>
                <b style="color:${data.color}">${data.nick}:</b> ${data.msg}
            </p>
        `);
    });

    // MENSAJES ANTIGUOS
    socket.on('Cargando viejos mensajes', data => {
        data.forEach(msg => {
            $chat.append(`
                <p>
                    <b style="color:#ccc">${msg.nick}:</b> ${msg.msg}
                </p>
            `);
        });
    });

    // USUARIOS
    socket.on('usernames', data => {
        let html = '';
        data.forEach(name => {
            html += `<p>${name}</p>`;
        });
        $users.html(html);
    });

    // NOTIFICACIONES
    socket.on('notificacion', data => {
        $chat.append(`<p class="notificacion">${data}</p>`);
    });

    // PRIVADOS
    socket.on('whisper', data => {
        $chat.append(`
            <p class="whisper">
                <b style="color:${data.color}">
                    ${data.nick} (privado):
                </b> ${data.msg}
            </p>
        `);
    });

});