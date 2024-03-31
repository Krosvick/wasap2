import crypto from "crypto";

/* MODULE FOR SETTING UP ENCRYPTION */

const IV_LENGTH = 16;
const KEY_LENGTH = 32;

const doRandomKey = () => {
    return crypto.randomBytes(KEY_LENGTH);
}

const doRandomIV = () => crypto.randomBytes(IV_LENGTH);

export {doRandomIV, doRandomKey};
