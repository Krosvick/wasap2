import express, { Request, Response } from "express";
//import fs from "fs";
import userRouter from "./userRouter";
import apiRouter from "./miniapi";
import morgan from "morgan";
import helmet from "helmet";

const app = express();

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
