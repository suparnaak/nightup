import { Request, Response } from 'express';

export interface IEventController {
  addEvent(req: Request, res: Response): Promise<void>;
  getEvents(req: Request, res: Response): Promise<void>;
  getAllEvents(req: Request, res: Response): Promise<void>;
  getEventDetails(req: Request, res: Response): Promise<void>
  editEvent(req: Request, res: Response): Promise<void>
  deleteEvent(req: Request, res: Response): Promise<void>
}
