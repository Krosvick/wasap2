import { Router, Request, Response } from "express";
import prisma from "../../db/prisma";
import { StatusCodes } from "http-status-codes";

export const convRoute = Router({mergeParams : true})

convRoute.get("/", async (req : Request, res : Response) => {
    const conversations = await prisma.conversation.findMany({
        select : {
            id : true,
            participants : {
                //we only care abt the username not the other weird stuff.
                select: {
                    username : true,
                }
            },
            messages: {
                select: {
                    content: true,
                    //this may look better one-lined.
                    sender: {select: {username: true}},
                    createdAt : true,
                },
                orderBy: {
                    createdAt: "asc",
                }
            },
        },
    });
    res.json(conversations);
})

