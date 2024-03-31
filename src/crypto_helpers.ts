import crypto from "crypto";

/* MODULE FOR SETTING UP ENCRYPTION */

const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const BASE_ENCODING = "hex";

const doRandomKey = () => {
    return crypto.randomBytes(KEY_LENGTH);
}

const doRandomIV = () => crypto.randomBytes(IV_LENGTH);

const toBuffer = (iv : string, key : string) => {
    const bufferIv = Buffer.from(iv, BASE_ENCODING);
    const bufferKey = Buffer.from(key, BASE_ENCODING);

    return [bufferIv, bufferKey];
}

export {doRandomIV, doRandomKey, toBuffer};
