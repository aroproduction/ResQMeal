import { NextResponse } from "next/server";
import { sendOTP } from "@/services/auth.service";

export const POST = async (req) => {
  const { email } = await req.json();

  try {
    await sendOTP(email);
    return NextResponse.json({
      success: true,
      data: { message: "OTP sent successfully" }
    }, { status: 200 });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({
      success: false,
      error: {
        message: "Failed to send OTP",
        details: error.message,
      }
    }, { status: 500 });
  }
}

