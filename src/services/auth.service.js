import { PrismaClient } from "@prisma/client";
import { redis } from "@/lib/redis";
import { sendEmail } from "@/lib/mail";

const prisma = new PrismaClient();

// Send OTP to user's email
export const sendOTP = async(email) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);
        await redis.set(`otp:${email}`, otp, { ex: 300 }); // Store OTP in Redis with 5 minutes expiration
        await sendEmail(
            email,
            "Your OTP Code",
            `Your OTP code is <strong style="font-size:2em;">${otp}</strong>`
        );
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw new Error("Failed to send OTP");
    }
}

// return true if the otp matches false otherwise
export const verifyOTP = async (email, otp) => {
    try {
        const storedOTP = await redis.get(`otp:${email}`);
        console.log("Stored OTP:", storedOTP);
        if (storedOTP && storedOTP == otp) {
            await redis.del(`otp:${email}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw new Error("Failed to verify OTP");
    }
}
