import express, { Request, Response } from 'express';
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Express!');
});

app.get("/login", (req: Request, res: Response) => {
  fs.readFile("pseudoviews/login.html", "utf-8", (err, data : string) => {
    if(err) {
      res.send("not loaded!!!!");
      return;
    }

    res.send(data);
  })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});