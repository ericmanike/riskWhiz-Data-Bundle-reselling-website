import { ReactNode } from "react";
import StoreNavbar from "@/components/layout/StoreNavbar";
import dbConnect from "@/lib/mongoose";
import Stores from "@/models/Stores";
import mongoose from "mongoose";

export default async function PublicStoreLayout({ 
  children, 
  params 
}: { 
  children: ReactNode,
  params: Promise<{ storename: string }>
}) {
  const { storename } = await params;
  await dbConnect();

  const decoded = decodeURIComponent(storename);
  const searchString = decoded.replace(/-/g, " ");

  let store: any = await Stores.findOne({
      storeName: { $regex: new RegExp(`^${searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") }
  }).select("storeName phoneNumber");

  if (!store && mongoose.Types.ObjectId.isValid(storename)) {
      store = await Stores.findOne({ agent: storename }).select("storeName phoneNumber");
  }

  return (
    <>
      <StoreNavbar phoneNumber={store?.phoneNumber} storeName={store?.storeName} />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}
