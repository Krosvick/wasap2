import express, { Router, Request, Response } from "express";
import prisma from "./db/prisma";
import {excludeAttrByOne, excludeAttrByMany} from "./prisma_helper";
import { StatusCodes } from "http-status-codes";
import { STATUS_CODES } from "http";

const app = express();

// Define routers
const apiRouter = Router();
const userRouter = Router({mergeParams : true});
const friendRouter = Router({ mergeParams: true });

// API Base stuff
apiRouter.get("/", (req: Request, res: Response) => {
    res.send("Testing API stuff.");
});

// User router stuff
apiRouter.use("/users", userRouter);

userRouter.get("/", async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    // any la vieja confiable.
    excludeAttrByMany(users, "password");
    res.json(users);
});

userRouter.get("/:uName", async (req: Request, res: Response) => {
    const uName = req.params.uName;
    const user = await prisma.user.findUnique({
        where: {
            username: uName,
        }
    });

    if (!user) {
        res.send(`No user with name ${uName} was found!`);
        return;
    }

    let saneUser = excludeAttrByOne(user, "password");
    res.json(saneUser);
});

// Friend router stuff
friendRouter.get("/", async (req: Request, res: Response) => {
    const uName = req.params.id;
    
    if (!uName) {
        res.send("Not valid user?");
        return;
    }

    const userObj = await prisma.user.findUnique({where : {username : uName}});

    if (userObj === null) {
        res.status(StatusCodes.NOT_FOUND).send("User not found!");
        return;
    }

    const friends = userObj.friendListPlaceIds;

    res.json(friends);
    // Logic to handle fetching friends
    //res.send("List of friends");
});

// Mount friendRouter under userRouter
userRouter.use("/:id/friends", friendRouter);

// Mount apiRouter as the main router
app.use("/api", apiRouter);

// Listen on port 3000
app.listen(3000, () => {
    console.log(`Server is running at http://localhost:${3000}`);
});
