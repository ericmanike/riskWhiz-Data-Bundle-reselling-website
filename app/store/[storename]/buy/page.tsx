import { Suspense } from "react";
import BuyContent from "./BuyContent";



export default function BuyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-24 text-center">Loading...</div>}>
            <BuyContent />
        </Suspense>
    );
}
