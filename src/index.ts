import express, { Request, Response, Router } from "express";
//import fs from "fs";
import authRouter from "./routers/authRouter";
import { usersRouter } from "./routers/usersRouter";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { join } from "node:path";
import { convRouter } from "./routers/userRelated/conversationsRouter";
import cookieParser from "cookie-parser";

const VIEWS_DIR = join(__dirname, "..", "pseudoviews");

const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(cookieParser());
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
    "/api/users/:username": "Get a user by username",
    "/api/users/:username/friends": "Get a user's friends",
    "api/users/:username/conversations": "Get a user's conversations",
    "/api/users/:username/messages": "Get a user's messages",
  });
});

const apiRouter = Router();

app.use("/api", apiRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/conversations", convRouter);

const server = createServer(app);
export const io = new Server(server);


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  const cookie = socket.handshake.headers.cookie;
  console.log("current cookies: ", cookie);
  //console.log(socket.handshake.headers.cookie);

  // Listen for incoming chat messages
  socket.on('chat message', (data) => {
    console.log('Received message:', data);

    // Save the message to MongoDB
    //const message = new Message({ user: data.user, text: data.message });
    /*
    message.save((err) => {
      if (err) {
        console.error('Error saving message to database:', err);
      } else {
        console.log('Message saved to the database');
      }
    });*/

    // Broadcast the message to all connected clients
    io.emit('chat message', data);
  });

  // Listen for user disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get("/socket", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/socket_test.html");
});

app.get("/form", (req: Request, res: Response) => {
  res.sendFile(VIEWS_DIR + "/login.html");
});


server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
