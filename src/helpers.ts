//This is for getting the User Payload from the JWT.
import cookie from "cookie";
import jwt from "jsonwebtoken";

enum LOG_TYPES {
    NONE = 0,
    ERROR = 1,
    WARNING = 2,
    INFO = 3,
}

const MESSAGES = {
    [LOG_TYPES.NONE] : "",
    [LOG_TYPES.ERROR] : "[ERROR]",
    [LOG_TYPES.WARNING] : "[WARNING]",
    [LOG_TYPES.INFO] : "[INFO]",
}

interface UserJWT {
    id : string;
    iat : number;
    exp : number;
}

interface ISocketInfo {
    id: string;
    userId : string;
    convId : string;
}

function excludeAttrByMany<T extends object>(obj: T[], key: keyof T): void {
    obj.forEach(data => delete data[key]);
}

function excludeAttrByOne(obj : object, keyToDelete : string) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== keyToDelete));
}

function getCookieFromSocket(cookieTarget : string = "") : string | undefined {
    //Imagine providing no cookies.
    if(cookieTarget === "") 
        return;

    const parsedCookies = cookie.parse(cookieTarget);
    const token = parsedCookies.token;

    if(!token) 
        return;

    const decodedToken = jwt.decode(token, {complete : true});

    if (!decodedToken) 
        return;
    
    const payload = decodedToken.payload as UserJWT;
    return payload.id;
};

//very basic way to log things.
function debugLogs(mode : LOG_TYPES, ...args : any[]) {
    const shouldDisplay = Boolean(process.env.LOG);
    if (!shouldDisplay) {
        return;
    }

    console.log(MESSAGES[mode], ...args);
}

export {excludeAttrByOne, excludeAttrByMany, debugLogs, LOG_TYPES, getCookieFromSocket, UserJWT};