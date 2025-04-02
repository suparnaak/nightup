import { Request, Response } from "express";

export interface IWalletController {
    getWallet(req: Request, res: Response): Promise<void>
    createOrder(req: Request, res: Response): Promise<void>
    verifyPayment(req: Request, res: Response): Promise<void>
    
}
