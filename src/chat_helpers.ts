import { ISocketInfo } from "./helpers";

const leaveRoom = (socketId : string, allUsers : ISocketInfo[]) => {
    return allUsers.filter(user => user.id !== socketId);
}

export {leaveRoom}