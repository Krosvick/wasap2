import express, { Request, Response } from "express";
//import fs from "fs";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/friend-userRouter";
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
app.use(helmet({contentSecurityPolicy: false}));
app.use(morgan("dev"));

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.use("/user", userRouter);
app.use("/api", apiRouter);

app.get("/login", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "login.html");
  /*
  fs.readFile("pseudoviews/login.html", "utf-8", (err, data : string) => {
    if(err) {
      res.send("not loaded!!!!");
      return;
    }

    res.send(data);
  })*/
});

const server = createServer(app);
const io = new Server(server);

io.on("connection", () => {
  console.log('a user connected');
});

app.get("/socket", (req : Request, res : Response) => {
  res.sendFile(VIEWS_DIR + "socket_test.html");
})

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
