import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/utils/database";

export async function POST(request: NextRequest) {
    console.log('▶︎Call POST');
    try {
        connectDB();
        const body = await request.json();
        console.log('Request Body:', body);
        return NextResponse.json({ message: "Success: connected to MongoDB" });
    } catch {
        return NextResponse.json({ message: "Failure: unconnected to MongoDB" });
    }
}