import express, { Request, Response, Router } from "express";
//import fs from "fs";
import userRouter from "./routers/userRouter";
import { usersRouter } from "./routers/usersRouter";
import morgan from "morgan";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { join } from "node:path";

const VIEWS_DIR = join(__dirname, "..", "pseudoviews");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//This is only for testing the io external script.
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  //json response explaining the different api routes
  res.json({
    "/api": "Base API route",
    "/api/users": "Get all users",
    "/api/users/:uName": "Get a user by username",
    "/api/users/:uName/friends": "Get a user's friends",
    "/api/users/:uName/messages": "Get a user's messages",
  });
});

const apiRouter = Router();

app.use("/api", apiRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/user", userRouter);

const server = createServer(app);
const io = new Server(server);

io.on("connection", () => {
  console.log("a user connected");
});

app.get("/socket", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "socket_test.html");
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
