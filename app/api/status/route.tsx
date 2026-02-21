import { NextResponse, NextRequest } from "next/server";

export async function POST(request: NextRequest) {  
 const {transaction_id} = await request.json();
 
 if (!transaction_id) {
    return NextResponse.json({ message: "Transaction ID is required" }, { status: 400 });
  }
 
try{
 const DakaziApi =process.env.DAKAZI_API_KEY!;

 if (!DakaziApi) {
    console.log('API key not found');
    return NextResponse.json({ message: "API key not found" }, { status: 500 });
  }




     const res = await fetch(
      `https://reseller.dakazinabusinessconsult.com/api/v1/fetch-single-transaction`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": `${DakaziApi}`,
          "Accept": "application/json"
           
        },
        body: JSON.stringify({
          transaction_id: transaction_id
        })
      }
    );


    if (!res.ok) {
      console.log('Failed to fetch transaction status:', res.statusText);
      return NextResponse.json({ message: "Failed to fetch transaction status: " + res.statusText }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({data: data }, { status: 200 });






} catch (error) {
    return NextResponse.json({ message: "Error", error: error }, { status: 500 });
}



 }