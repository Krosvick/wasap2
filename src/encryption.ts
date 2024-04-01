//dummy ahh encryption thingy.
import crypto from "crypto";
import { doRandomIV, doRandomKey, toBuffer } from "./crypto_helpers";
import { text } from "cheerio";

const BASE_ENCODING = "hex";
//all variables for crypto will start with CRYPTO prefix.
const ALGORITHM = process.env.CRYPTO_ALGORITHM;

//This should be a 32 bytes thing.
const KEY = process.env.CRYPTO_KEY;//crypto.randomBytes(32);
//This 16.
const IV = process.env.CRYPTO_IV;//crypto.randomBytes(16);

const randIv = doRandomIV();
const key = doRandomKey();

function encrypt(textData : string) {
    const [ivBuffer, ivKey] = toBuffer(IV, KEY);

    //TYPESCRIPT MOMENT.
    if(!ALGORITHM || !ivBuffer || !ivKey) {
        return;
    }

    const buffer = Buffer.from(textData, "utf-8");
    const cipher = crypto.createCipheriv(ALGORITHM, ivKey, ivBuffer);
    return Buffer.concat([cipher.update(buffer), cipher.final()]);
}

function decrypt(buffer : Buffer) {
    const [ivBuffer, ivKey] = toBuffer(IV, KEY);

    //TYPESCRIPT MOMENT.
    if(!ALGORITHM || !ivBuffer || !ivKey) {
        return;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, ivKey, ivBuffer);
    return Buffer.concat([decipher.update(buffer), decipher.final()]);
}
export {encrypt, decrypt};
