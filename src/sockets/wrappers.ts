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
import { SendMessageTypeBackend } from "../schemas/messagesSchema";

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
      //! CHECK IF USER IS IN THE ARRAY
      const user = this.getUser(socket);

      //! IF USER IS IN THE ARRAY, IS A DUPLICATED MF
      if (user) {
        socket.broadcast.to(user.id).emit("check-duplicate", {
          user: user.userId,
          duplicated: !!user,
        });
      }
      socket.on(
        "join-conversations",
        async (data) => await this.onSocketJoin(socket, data),
      );
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

  public getUser(socket: Socket): ISocketInfo | false {
    const cookief = this.getCookies(socket);
    const userId = getCookieFromSocket(cookief);

    if (!userId) {
      return false;
    }

    const user = this.allUsers.find((userObj) => userObj.userId === userId);
    if (!user) {
      return false;
    }
    return user;
  }

  public getCookies(socket: Socket) {
    return socket.handshake.headers.cookie;
  }

  //IMPLEMENT THIS PLS.
  public async onSocketJoin(socket: Socket, data: any) {}

  public async onConversationJoin(socket: Socket, data: any) {}

  public async onMessageReceive(socket: Socket, data: any[]) {}

  public abstract onMessageSend(
    socket: Socket,
    data: SendMessageTypeBackend,
  ): void;

  public onDisconnect(socket: Socket) {
    this.deleteUserFromSocket(socket);
  }

  public deleteUserFromSocket(socket: Socket) {
    this.allUsers = leaveRoom(socket.id, this.allUsers);
  }
}

//TODO: Implement.
class StaticChatSocket extends BaseSocket {
  constructor(server: HttpServer, options: Partial<OptionsInterface>) {
    super(server, options);
  }
  private pushUserToSocket(socket: Socket, userId: string, convIds: string[]) {
    //here we push the user to the allUsers array.
    //if the user is already in the array, push the socket.id to the id array. and leave the userId and convId as is.
    const user = this.allUsers.find((user) => user.userId === userId);
    if (user) {
      user.id.push(socket.id);
      return false;
    } else {
      this.allUsers.push({
        id: [socket.id],
        userId: userId,
        convId: convIds,
      });
      return true;
    }
  }

  override async onSocketJoin(
    socket: Socket,
    data: { conversations: string[] },
  ) {
    const cookief = this.getCookies(socket);
    const convIds = data.conversations;
    const userId = getCookieFromSocket(cookief);

    if (!userId || !convIds) {
      return;
    }

    //push the user to the allUsers array.
    const result = this.pushUserToSocket(socket, userId, convIds);
    //Send the status to clients in the 'Whatsapp-like' thing.

    if (!result) {
      return;
    }
    socket.emit("user-status", {
      status: "connected",
    });

    debugLogs(LOG_TYPES.INFO, `User ${userId} joined to ${convIds}`);
  }

  override async onMessageSend(socket: Socket, data: SendMessageTypeBackend) {
    const cookief = this.getCookies(socket);
    const userId = getCookieFromSocket(cookief);

    const { conversationId, message, receiverId } = data;

    if (!userId) {
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        username: true,
      },
    });

    if (!user) {
      return;
    }

    //look up the allusers array and try find the receiverId, if found send the message to the receiverId.
    //if not found, save to db
    const receiverTargetSocketId = this.allUsers.find(
      (user) => user.userId === receiverId,
    )?.id[0];

    //!check if the conversation is valid.
    const actualConv = await isValidConversation(conversationId, receiverId);

    debugLogs(
      LOG_TYPES.INFO,
      `Trying to send a message to user ${receiverId} from ${user.username}`,
    );
    if (receiverTargetSocketId && actualConv) {
      socket.broadcast.to(receiverTargetSocketId).emit("send-message", {
        user: user.username,
        message: message,
        convId: conversationId,
      });
      socket.to(socket.id).emit("message-sent", {
        user: user.username,
        message: message,
        convId: conversationId,
      });
    }
    //LOG INFO ABOUT THE MESSAGE.
    debugLogs(
      LOG_TYPES.INFO,
      `Message Info: User ${user.username} Message: ${message}`,
    );

    if (!actualConv) {
      debugLogs(
        LOG_TYPES.WARNING,
        `User ${user.username} is trying to send the ${message} message to DB in Room ${conversationId}`,
      );
      return;
    }

    debugLogs(
      LOG_TYPES.INFO,
      `Saving to DB: User: ${user.username} Message: ${data.message}`,
    );

    await saveMessage(conversationId, data.message, user.username)
      .then((message) => {
        console.log("Message saved!", message.id);
        socket.to(socket.id).emit("message-sent", {
          user: user.username,
          message: message.content,
          convId: conversationId,
        });
      })
      .catch((err) => {
        debugLogs(LOG_TYPES.ERROR, err);
      });
  }
}

class LiveChatSocket extends BaseSocket {
  constructor(server: HttpServer, options: Partial<OptionsInterface>) {
    super(server, options);
  }

  private pushUserToSocket(socket: Socket, userId: string, convIds: string[]) {
    //here we push the user to the allUsers array.
    //if the user is already in the array, push the socket.id to the id array. and leave the userId and convId as is.
    const user = this.allUsers.find((user) => user.userId === userId);
    if (user) {
      user.id.push(socket.id);
      return;
    } else {
      this.allUsers.push({
        id: [socket.id],
        userId: userId,
        convId: convIds,
      });
    }
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
  override async onSocketJoin(
    socket: Socket,
    data: { conversations: string[] },
  ) {
    //storedUsers = leaveRoom(socket.id, storedUsers);
    this.deleteUserFromSocket(socket);

    const cookief = this.getCookies(socket);
    const convIds = data.conversations;
    const userId = getCookieFromSocket(cookief);

    console.log(`User ${userId} is trying to join to ${convIds}`);

    console.log(data);

    if (!userId || !convIds) {
      return;
    }

    //Make sure we joined the conversation.
    const joinResponse = await socket.join(convIds);
    console.log(`User ${userId} joined to ${convIds}`, joinResponse);

    //Send the status to clients in the 'Whatsapp-like' thing.
    socket.emit("user-status", {
      status: "connected",
    });

    this.pushUserToSocket(socket, userId, convIds);

    debugLogs(LOG_TYPES.INFO, `User ${userId} joined to ${convIds}`);
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

    const actualConv = await isValidConversation(convTarget[0]);

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

    await saveMessage(convTarget[0], data.message, user.username)
      .then((message) => {
        console.log("Message saved!", message.id);
      })
      .catch((err) => {
        debugLogs(LOG_TYPES.ERROR, err);
      });
  }
}

export { LiveChatSocket, BaseSocket, StaticChatSocket };
