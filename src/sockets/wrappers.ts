import { Server as HttpServer } from "http";
import { Server as IOServer, Socket } from "socket.io";
import {
  ISocketInfo,
  OptionsInterface,
  isValidConversation,
  leaveRoom,
  saveMessage,
} from "../chat_helpers";
import { LOG_TYPES, debugLogs, getCookieFromSocket } from "../helpers";
import prisma from "../db/prisma";

abstract class BaseSocket {
  //private server: HttpServer;
  protected ioSocket: IOServer;
  protected allUsers: ISocketInfo[];

  constructor(server: HttpServer, options: Partial<OptionsInterface>) {
    //this.server = server;
    this.ioSocket = new IOServer(server, options);

    //Init this as empty.
    this.allUsers = [];
  }

  public initialize() {
    this.ioSocket.on("connection", (socket) => {
      socket.on(
        "enter-conversation",
        async (data) => await this.onConversationJoin(socket, data),
      );
      socket.on(
        "send-message",
        async (data) => await this.onMessageSend(socket, data),
      );
      socket.on("disconnect", () => this.onDisconnect(socket));
    });
  }

  public getCookies(socket: Socket) {
    return socket.handshake.headers.cookie;
  }

  //IMPLEMENT THIS PLS.
  public async onConversationJoin(socket: Socket, data: any[]) {}

  public async onMessageSend(socket: Socket, data: any[]) {}

  public onDisconnect(socket: Socket) {
    this.deleteUserFromSocket(socket);
  }

  public deleteUserFromSocket(socket: Socket) {
    this.allUsers = leaveRoom(socket.id, this.allUsers);
  }
}

class LiveChatSocket extends BaseSocket {
  constructor(server: HttpServer, options: Partial<OptionsInterface>) {
    super(server, options);
  }

  private pushUserToSocket(socket: Socket, userId: string, convId: string) {
    this.allUsers.push({ id: socket.id, userId, convId });
  }

  public override initialize(): void {
    super.initialize();
  }

  override async onConversationJoin(socket: Socket, data: any) {
    //storedUsers = leaveRoom(socket.id, storedUsers);
    this.deleteUserFromSocket(socket);

    const cookief = this.getCookies(socket);
    const convId = data.conversation;
    const userId = getCookieFromSocket(cookief);

    console.log(`User ${userId} is trying to join to ${convId}`);

    console.log(data);

    if (!userId || !convId) {
      return;
    }

    //Make sure we joined the conversation.
    const joinResponse = await socket.join(convId);
    console.log(`User ${userId} joined to ${convId}`, joinResponse);

    //Send the status to clients in the 'Whatsapp-like' thing.
    socket.emit("user-status", {
      status: "connected",
    });

    this.pushUserToSocket(socket, userId, convId);

    debugLogs(LOG_TYPES.INFO, `User ${userId} joined to ${convId}`);
  }

  override async onMessageSend(socket: Socket, data: any) {
    const cookief = this.getCookies(socket);
    const userId = getCookieFromSocket(cookief);

    if (!userId) {
      return;
    }

    console.log(`Received message from ${userId}:`, data);

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        username: true,
        id: true,
      },
    });

    if (!user) {
      return;
    }

    const convTarget = this.allUsers.find(
      (sender) => sender.userId === user.id,
    )?.convId;

    debugLogs(
      LOG_TYPES.INFO,
      `Trying to send a message to the room: ${convTarget} from ${user.username}`,
    );

    if (!convTarget) return;

    //Send message anyways.
    this.ioSocket.to(convTarget).emit("send-message", {
      user: user.username,
      message: data.message,
    });

    //LOG INFO ABOUT THE MESSAGE.
    debugLogs(
      LOG_TYPES.INFO,
      `Message Info: Room ${convTarget}, User: ${user.username} Message: ${data.message}`,
    );

    const actualConv = await isValidConversation(convTarget);

    if (!actualConv) {
      debugLogs(
        LOG_TYPES.WARNING,
        `User ${user.username} is trying to send the ${data.message} message to DB in Room ${convTarget}`,
      );
      return;
    }

    debugLogs(
      LOG_TYPES.INFO,
      `Saving to DB: User: ${user.username} Message: ${data.message}`,
    );

    await saveMessage(convTarget, data.message, user.username)
      .then((message) => {
        console.log("Message saved!", message.id);
      })
      .catch((err) => {
        debugLogs(LOG_TYPES.ERROR, err);
      });
  }
}

export { LiveChatSocket };
