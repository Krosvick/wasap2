
import prisma from "../db/prisma";
const EMAIL_REGEX : RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

//This should be better a helper module huh.
export class UserValidator {
    public static isValidEmail(email : string) : boolean {
        return EMAIL_REGEX.test(email);
    }

    public static async isUserNameTaken(uName:  string) : Promise<boolean> {
        let user = await prisma.user.findFirst({
            where: {username: uName}
        })

        return user !== null;
    }
}