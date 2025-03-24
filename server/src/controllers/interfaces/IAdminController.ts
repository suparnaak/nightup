import { Request, Response } from "express"
export interface IAdminController {
    login(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    getHosts(req: Request, res: Response): Promise<void>;
    verifyDocument(req: Request, res: Response): Promise<void>
    hostToggleStatus(req: Request, res: Response): Promise<void>
    userToggleStatus(req: Request, res: Response): Promise<void>

}
