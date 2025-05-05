import { Request, Response } from "express";

export interface IReviewController {
 createReview(req: Request, res: Response): Promise<void>;
 getReviewByBookingId(req: Request, res: Response): Promise<void>
 getReviewsByEvent(req: Request, res: Response): Promise<void>
 getReviewsByHost(req: Request, res: Response): Promise<void>;

}
