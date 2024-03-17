import express, { Router, Request, Response} from "express";
import prisma from "./db/prisma";
import excludeAttribute from "./prisma_helper";

const router = Router();
const app = express();

router.get("/users", async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    //any la vieja confiable.
    excludeAttribute(users, "password");
    res.json(users);
})

app.use("/api", router)

//soy hardcoder
app.listen(3000, () => {
  console.log(`Server is running at http://localhost:${3000}`);
});
