
import express from 'express';
import { SERVER_PORT } from '../global/environment';
import socketIO, { Socket } from 'socket.io';
import http from 'http';
import * as socket from '../sockets/socket';

export default class Server {

    private static _instance: Server;
    public app: express.Application;
    public port: number;

    public io: socketIO.Server;
    private httpServer: http.Server;


    private constructor() {
        this.app = express();
        this.port = SERVER_PORT;
        this.httpServer = new http.Server( this.app );
        this.io = socketIO( this.httpServer );
        this.escucharSockets();
    }
    public static get instance() {

        return this._instance || (this._instance = new this());
    }
    private escucharSockets() {
     
        console.log('escuchando conecciones -sockets');

        this.io.on('connection', (cliente: Socket) => {
            console.log('Cliente conectado');
            // EntrarChat
            socket.entrarchat(cliente, this.io);
            console.log('SERVERSIDEentrarchat');
            
            // Crear Mensaje
            socket.CrearMensaje(cliente, this.io);

            // Mensajes
            socket.mensaje(cliente, this.io);

            // Mensaje Privado
            socket.mensajePrivado(cliente, this.io);

            // Desconectar
            socket.desconectar(cliente);

            // Lista personas
            // socket.listaPersona(cliente, this.io);
        });

        
    }
    start( callback: Function ) {

        this.httpServer.listen( this.port, callback );
    }

}