import { NextResponse } from "next/server";
import { verifyOTP } from "@/services/auth.service";

export const POST = async (req) => {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ success: false, error: "Email and OTP are required" }, { status: 400 });
  }

  try {
    const isValid = await verifyOTP(email, otp);
    if (isValid) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, message: "Invalid or expired OTP" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}