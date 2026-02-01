"use client"
import { useRouter } from "next/navigation"
import {useState} from 'react'
import {formatCurrency} from '@/lib/utils'
import { X } from 'lucide-react'
import { useSession } from "next-auth/react"


type Props = {
  isOpen: boolean
  amount: number | null
  setAmount: (amount: number | null) => void
  setIsOpen: (isOpen: boolean) => void
  handleTopUp: () => void
}

export default function RechargeModal({ isOpen, setAmount ,amount, setIsOpen, handleTopUp}: Props) {

const router = useRouter()

const { data: session } = useSession()
  const user = session?.user

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"  />

      <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Top Up Wallet</h2>
          <button onClick={()=> setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <div>
          You can top up your wallet using the following methods:
          <ol style={{ listStyleType: 'decimal' }} className=" bg-gray-100 p-4 rounded-md pl-10">

            <li><p className="font-semibold">Pay with Mobile Money - Manual
                <br/>
                Send the money to: <strong>0545463582</strong>
                <br/>
                Name: <strong>EUGINE SOGTI-NYE</strong>
                <br/>
                Reference: <strong>{user?.email}</strong> 
              
              
               </p></li>
            <li><p className="font-semibold">Pay with Paystack- Enter amount and click on confirm top up</p></li>
    
          </ol>


        </div>







        <div className="py-5 space-y-4 text-sm">
        
             
            <input
  type="number"
  placeholder="Enter amount"
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  onChange={(e) => {
    const value = e.target.value
    setAmount(value ? Number(value) : null)
  }}
  value={amount ?? ""}
  min={10}

/>
{amount && (
<p>
  You will be charged <span className="font-semibold">{formatCurrency(amount + (amount * 0.02))}</span> for this top up
  <br />
  Transaction fee is <span className="font-semibold">2%</span>
</p>
)}
      
          
        </div>

        <div className="flex  justify-between mt-6 ">
          <button onClick={()=> setIsOpen(false)}
            className="px-6 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 transition-colors">
            Cancel
          </button>
          <button
            className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            onClick={handleTopUp}
          >
            Confirm Top Up
          </button>
        </div>
      </div>
    </div>
  )
}