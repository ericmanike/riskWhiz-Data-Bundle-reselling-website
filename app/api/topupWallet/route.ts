import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req:NextRequest){
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        await dbConnect();

        const {email , amount} = await req.json();

        const user = await User.findOne({email});
        if(!user){
            return NextResponse.json({message:"Unauthorized access"} , {status:400})
        }

 await User.findOneAndUpdate({email} ,{$inc: {walletBalance: amount }})
        // user.walletBalance += amount;
        // await user.save();
  
        console.log("User wallet balance updated", user.walletBalance)

    } catch (error) {
        console.log(error)
    }

    return NextResponse.json({message:"Wallet top-up successful"} , {status:200})
}
