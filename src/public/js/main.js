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

    // LOGIN
    $nickForm.submit(e => {
        e.preventDefault();

        socket.emit('nuevo usuario', $nickname.val(), data => {
            if(data){
                $nickWrap.hide();
                $contentWrap.show();
            } else {
                $nickError.html('<div class="alert alert-danger">Usuario ya existe</div>');
            }
        });

        $nickname.val('');
    });

    // ENVIAR MENSAJE
    $messageForm.submit(e => {
        e.preventDefault();

        socket.emit('enviar mensaje', $messageBox.val(), data => {
            if(data){
                $chat.append(`<p class="error">${data}</p>`);
            }
        });

        $messageBox.val('');
    });

    // MENSAJES NUEVOS
    socket.on('new-message', data => {
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