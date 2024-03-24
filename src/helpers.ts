import { Socket } from "socket.io";

interface UserJWT {
    user : string;
    iat : number;
    exp : number;
}

function excludeAttrByMany<T extends object>(obj: T[], key: keyof T): void {
    obj.forEach(data => delete data[key]);
}

function excludeAttrByOne(obj : object, keyToDelete : string) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== keyToDelete));
}

export {excludeAttrByOne, excludeAttrByMany, UserJWT};