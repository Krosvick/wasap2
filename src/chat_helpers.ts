interface ISocketInfo {
    id: string;
    userId : string;
    convId : string;
}

const leaveRoom = (socketId : string, allUsers : ISocketInfo[]) => {
    return allUsers.filter(user => user.id !== socketId);
}

export {leaveRoom, ISocketInfo}