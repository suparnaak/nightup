import { Request, Response } from "express";
import UserService from "../services/userService";
import { MESSAGES, STATUS_CODES, PASSWORD_RULES } from "../utils/constants";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    this.signup = this.signup.bind(this); 
  }

  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, phone, password, confirmPassword } = req.body;

      // ✅ Check if all fields are provided
      if (!name || !email || !phone || !password || !confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.MISSING_FIELDS });
        return;
      }

      // ✅ Name Validation (only letters and spaces, no symbols or numbers)
      const nameTrimmed = name.trim();

      if (!nameTrimmed) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_NAME });
        return;
      }
      
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!nameRegex.test(nameTrimmed)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_NAME });
        return;
      }

      // ✅ Email Format Validation
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_EMAIL });
        return;
      }

      // ✅ Phone Number Validation (10 digits, not all zeros)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone) || phone === "0000000000") {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.INVALID_PHONE });
        return;
      }

      // ✅ Password Length Validation
      if (password.length < PASSWORD_RULES.MIN_LENGTH) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.WEAK_PASSWORD });
        return;
      }

      // ✅ Password and Confirm Password Match
      if (password !== confirmPassword) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Passwords do not match" });
        return;
      }

      // ✅ Check if Email Already Exists (service layer validation)
      const existingUser = await this.userService.findUserByEmail(email);
      if (existingUser) {
        res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.COMMON.ERROR.EMAIL_IN_USE });
        return;
      }

      // 🚀 Register User
      const user = await this.userService.signup(name, email, phone, password);

      // 🚀 Send Success Response
      res.status(STATUS_CODES.CREATED).json({
        message: MESSAGES.COMMON.SUCCESS.REGISTERED,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      });

    } catch (error) {
      const errMessage = error instanceof Error ? error.message : MESSAGES.COMMON.ERROR.UNKNOWN_ERROR;
      res.status(STATUS_CODES.BAD_REQUEST).json({ message: errMessage });
    }
  }
}

export default new UserController();
