//dummy ahh encryption thingy.
import crypto from "crypto";

const BASE_ENCODING = "hex";
//all variables for crypto will start with CRYPTO prefix.
const ALGORITHM = process.env.CRYPTO_ALGORITHM;

//This should be a 32 bytes thing.
const KEY = process.env.CRYPTO_KEY;//crypto.randomBytes(32);
//This 16.
const IV = process.env.CRYPTO_IV;//crypto.randomBytes(16);


