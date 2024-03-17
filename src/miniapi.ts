import express, { Router, Request, Response } from "express";
import prisma from "./db/prisma";
import excludeAttribute from "./prisma_helper";

const app = express();

// Define routers
const apiRouter = Router();
const userRouter = Router();
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
    excludeAttribute(users, "password");
    res.json(users);
});

userRouter.get("/:uName", async (req: Request, res: Response) => {
    const uName = req.params.uName;
    const user = await prisma.user.findUnique({
            username: uName,
        }
    });

    if (!user) {
        res.send(`No user with name ${uName} was found!`);
        return;
    }

    excludeAttribute(user, "password");
    res.json(user);
});

// Friend router stuff
friendRouter.get("/", (req: Request, res: Response) => {
    // Logic to handle fetching friends
    res.send("List of friends");
});

// Mount friendRouter under userRouter
userRouter.use("/:id/friends", friendRouter);

// Mount apiRouter as the main router
app.use("/api", apiRouter);

// Listen on port 3000
app.listen(3000, () => {
    console.log(`Server is running at http://localhost:${3000}`);
});
