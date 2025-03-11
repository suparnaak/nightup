import bcrypt from "bcryptjs";
import { IUser } from "../models/user";
import UserRepository from "../repositories/userRepository";
import { IUserService } from "./interfaces/IUserService";
import {sendOtpEmail} from "../utils/mailer";
import {generateOTP} from "../utils/otpGenerator"; // if you've made one already

class UserService implements IUserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async signup(name: string, email: string, phone: string, password: string): Promise<IUser> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiry
    const otp = generateOTP(); // Example: "123456"
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Create user with OTP fields
    const newUser = await this.userRepository.createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
      isBlocked: false,
      isAdmin: false,
    } as IUser);

    // Send OTP Email
    await sendOtpEmail(email, otp);

    return newUser;
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findByEmail(email);
  }
}

export default UserService;
