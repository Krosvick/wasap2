import { Server as HttpServer, createServer} from "http";
import {Server as IOServer} from "socket.io"
import { ISocketInfo } from "../chat_helpers";

abstract class BaseSocket {
    private server: HttpServer;
    private ioSocket : IOServer;
    private allUsers : ISocketInfo[];

    constructor(server : HttpServer, options : any) {
        this.server = server;
        this.ioSocket = new IOServer(server, options);

        //Init this as empty.
        this.allUsers = [];
    }

    
}