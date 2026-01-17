'use client'

import Link from "next/link";
import { ArrowRight, Wifi, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { FaPhone, FaWhatsapp } from "react-icons/fa";

export default function Home() {
  return (
    <div className=" md:mt-20 flex flex-col items-center min-h-[80vh] bg-zinc-50 pt-20">
      
      {/* Hero Section */}
      <main className="w-[90vw] mx-auto flex flex-col items-center text-center px-6 mt-10">

        <motion.h1
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-6"
        >
          Buy   Affordable Data Bundles for All Networks
        </motion.h1>

        <p className="text-slate-600 text-sm md:text-base mb-6 max-w-xl">
          RiskWhiz provides affordable data bundle delivery across Ghana.
        </p>

        <div className="mb-4 mt-4 p-4 bg-yellow-500 text-brown-900 rounded-2xl animate-bounce hover:animate-none">
          <Wifi size={40} />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-[70vw] text-left">

      
          <div className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
            <Wifi className="text-blue-600 mb-3" size={24} />
            <h3 className="font-semibold mb-1 text-slate-900">
              All Major Networks
            </h3>
            <p className="text-sm text-slate-600">
              MTN, Telecel, and AirtelTigo supported.
            </p>
          </div>

               <div className="p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
            <Shield className="text-green-500 mb-3" size={24} />
            <h3 className="font-semibold mb-1 text-slate-900">
              Affordable Prices
            </h3>
            <p className="text-sm text-slate-600">
              Enjoy competitive rates with great value for money.
            </p>
          </div>


           <div className="md:col-span-2 p-6 rounded-2xl border bg-white shadow-sm hover:shadow-md transition">
            <Zap className="text-yellow-400 mb-3" size={24} />
            <h3 className="font-semibold mb-1 text-slate-900">
              Instant Delivery
            </h3>
            <p className="text-sm text-slate-600">
              Receive your data bundle within seconds after payment.
            </p>
          </div>





        </div>

        {/* CTA */}
        <div className="w-[70vw] mt-10">
          <Link href="/buy">
            <div className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
              <div className="flex items-center justify-between p-5">
                <div className="text-left">
                  <h4 className="font-semibold text-base">
                    Place Your Order Now
                  </h4>
                  <p className="text-sm text-blue-100">
                    A simple 3-step process to get your data bundle.
                  </p>
                </div>
                <ArrowRight size={22} />
              </div>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer Actions */}
      <div className="w-full px-5 py-10 bg-black/5 grid grid-cols-1 gap-4 md:flex md:justify-around text-sm text-slate-600 text-center mt-10">

        <a
          href="https://wa.me/233543442518"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#0e0947] text-white rounded-lg p-3 hover:font-bold transition duration-300"
        >
          Join us on WhatsApp <FaWhatsapp />
        </a>

        <a
          href="/contact"
          className="flex items-center justify-center gap-2 bg-[#0e0947] text-white rounded-lg p-3 hover:font-bold     transition duration-300"
        >
          Contact Support <FaPhone />
        </a>

        <a
          href="/terms"
          className="flex items-center justify-center bg-[#0e0947] text-white rounded-lg p-3 hover:font-bold transition duration-300"
        >
          Terms of Service
        </a>
      </div>
    </div>
  );
}
