import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";
import { StatusCodes } from "http-status-codes";

export const convRoute = Router({mergeParams : true})

convRoute.get("/", async (req : Request, res : Response) => {
    const conversations = await prisma.conversation.findMany({
    });
    res.json(conversations);
})