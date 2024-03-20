import express, { Request, Response } from "express";
//import fs from "fs";
import userRouter from "./routers/userRouter";
import apiRouter from "./routers/friend-userRouter";
import morgan from "morgan";
import helmet from "helmet";
import { Server } from "socket.io";
import { createServer } from "node:http";

const app = express();

const server = createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan("dev"));

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.use("/user", userRouter);
app.use("/api", apiRouter);

app.get("/login", (req: Request, res: Response) => {
  res.sendFile("pseudoviews/login.html");
  /*
  fs.readFile("pseudoviews/login.html", "utf-8", (err, data : string) => {
    if(err) {
      res.send("not loaded!!!!");
      return;
    }

    res.send(data);
  })*/
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
