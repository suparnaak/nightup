import { Request, Response } from "express";

export interface INotificationController {
 list(req: Request, res: Response): Promise<void>
 countUnread(req: Request, res: Response): Promise<void>
 markAsRead(req: Request, res: Response): Promise<void>
}
