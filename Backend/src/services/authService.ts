import { prisma } from '../db/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendMail } from '../utils/mailer'; // Ensure you have this utility
class ApiError extends Error {
  public status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface AuthInput {
  email: string;
  password?: string; // Optional for some actions
}

export const signupUser = async (body: AuthInput) => {
  const { email, password } = body;

  if (!password || password.length < 6) {
    throw new ApiError('Password must be at least 6 characters long', 400);
  }

  const existingUser = await prisma.adminUser.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError('An admin with this email already exists', 409);
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.adminUser.create({
    data: {
      email,
      hashed_password: hashedPassword,
    },
  });
};

export const loginUser = async (body: AuthInput) => {
  const { email, password } = body;
  if (!password) {
    throw new ApiError('Password is required for login', 400);
  }
  
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
  if (!isPasswordValid) {
    throw new ApiError('Invalid credentials', 401);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });

  return {
    token,
    user: { id: user.id, email: user.email },
  };
};

// --- NEW PASSWORD RESET FUNCTIONS ---

const generateAndStoreOtp = async (email: string, type: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10-minute expiry

  await prisma.otp.upsert({
    where: { email_type: { email, type } },
    update: { otpHash, expiresAt },
    create: { email, otpHash, expiresAt, type },
  });

  return otp;
};

export const handleForgotPassword = async (email: string) => {
  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (user) {
    const otp = await generateAndStoreOtp(email, "RESET_PASSWORD");
    await sendMail({
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your password reset OTP is: ${otp}.`,
      html: `<b>Your OTP is: ${otp}</b>`,
    });
  }
  // For security, always return the same message
  return { message: `If an account with ${email} exists, an OTP has been sent.` };
};

export const handleResetPassword = async (body: { email: string, otp: string, newPassword: string }) => {
    const { email, otp, newPassword } = body;

    const record = await prisma.otp.findUnique({
        where: { email_type: { email, type: "RESET_PASSWORD" } }
    });

    if (!record || new Date() > record.expiresAt) {
        throw new ApiError("OTP is invalid or has expired.", 400);
    }

    const isOtpValid = await bcrypt.compare(otp, record.otpHash);
    if (!isOtpValid) {
        throw new ApiError("Invalid OTP provided.", 400);
    }

    if (newPassword.length < 6) {
        throw new ApiError("New password must be at least 6 characters long.", 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
        where: { email },
        data: { hashed_password: hashedPassword },
    });

    await prisma.otp.delete({ where: { id: record.id } });
};
