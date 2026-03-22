import { ReactNode } from "react";
import StoreNavbar from "@/components/layout/StoreNavbar";


export default async function PublicStoreLayout({ children }: { children: ReactNode }) {
  

  return (
    <>
      <StoreNavbar />
      <main className="pt-20">
        {children}
      </main>
    </>
  );
}
