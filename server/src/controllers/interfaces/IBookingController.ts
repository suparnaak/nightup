import { Request, Response } from "express";

export interface IBookingController {
    createOrder(req: Request, res: Response): Promise<void>
    verifyPayment(req: Request, res: Response): Promise<void>
    createBooking(req: Request, res: Response): Promise<void>
}
