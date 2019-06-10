import { Socket } from 'socket.io';
import socketIO from 'socket.io';
import { Usuario } from '../classes/usuario';
import { UsuariosLista } from '../classes/usuarios-lista';
export const usuariosConectados = new UsuariosLista();

// ////////***TODO ESTE CLASS HAY QUE SACARLO... E IMPORTAR LA CLASE uSUARIOS */

// import Usuarios from '../sockets/usuarios';


export const entrarchat = (cliente: Socket, io: socketIO.Server) => {

    console.log('entrachatserverside');
    cliente.on('entrarChat', (data: any, callback: any) => { // DATA es el payload de chat.service.ts y trae = NOMBRE y SALA definidas al inicio como persona{ nombre: de params, sala:de params}
        // console.log('servidorSideSocketEntrarChat', data);
        if (!data.nombre || !data.sala) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }
        
        cliente.join(data.sala);
        console.log('serv', cliente.id);
        let usuario = new Usuario(cliente.id);
        usuario.nombre = data.nombre;
        usuario.sala = data.sala;
        usuariosConectados.agregar(usuario);
        console.log('serv', usuario);
        io.to(data.sala).emit('listaPersona', usuariosConectados.getLista());
        io.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', 'entró'));
        callback(usuariosConectados.getUsuariosEnSala(data.sala));
        // console.log('socket.ts', callback);
    });
}

// var  Usuarios  = require('../models/usuarios') ;

// console.log(usuarios);
export const crearMensaje = (nombre: string, mensaje: string) => {
    return {
        nombre,
        mensaje,
        fecha: new Date().getTime()
    };
};
// Aviso, cliente Desconectado
export const desconectar = (cliente: Socket) => {
    cliente.on('disconnect', (data) => {
        usuariosConectados.borrarUsuario(cliente.id);
        cliente.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} salió`));
        cliente.broadcast.to(data.sala).emit('listaPersona', usuariosConectados.getUsuariosEnSala(data.sala));
        // renderizarUsuarios(resp);
    });
};

//Escuchar mensajes
export const mensaje = (cliente: Socket, io: socketIO.Server) => {

    cliente.on('mensaje', (payload: { nombre: string, mensaje: string }) => {

        console.log('Mensaje recibido', payload);

        io.emit('mensaje-nuevo', payload);
    });
}

// Mensajes Privados
export const mensajePrivado = (cliente: Socket, io: socketIO.Server) => {

    cliente.on('mensajePrivado', function(data) {
        const usuario = new Usuario( cliente.id );
        io.to(data.para).emit('mensajePrivado', crearMensaje(usuario.nombre, data.mensaje));
        // cliente.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.name, data.mensaje));
    });
}


export const CrearMensaje = (cliente: Socket, io: socketIO.Server) => {

    cliente.on('crearMensaje', (data: any, callback: any) => {
        
        let persona = usuariosConectados.getUsuario(cliente.id);
        let mensaje = crearMensaje( data.persona.nombre, data.mensaje);
        console.log('satasala', mensaje, persona);
        io.to(data.sala).emit('crearMensaje', mensaje);
        callback(mensaje, persona);
    });
}

export const listaPersona = (cliente: Socket) => {

    cliente.on('listaPersona', (data: any, callback?: any) => {
        return data;
    });  
}