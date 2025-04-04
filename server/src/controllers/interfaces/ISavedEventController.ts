import { Request, Response } from "express";

export interface ISavedEventController {
   getSavedEvents(req: Request, res: Response): Promise<void>
   saveEvent(req: Request, res: Response): Promise<void>
   removeSavedEvent(req: Request, res: Response): Promise<void>
}
