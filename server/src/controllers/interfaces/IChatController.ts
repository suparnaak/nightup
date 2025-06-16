import { Request, Response } from "express";

export interface IChatController {
    fetchMessages(req: Request, res: Response): Promise<void>
    sendMessage(req: Request, res: Response): Promise<void>
    markMessagesAsRead(req: Request, res: Response): Promise<void>;
}
