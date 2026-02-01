'use client';
import React from 'react';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useForm, ValidationError } from '@formspree/react';

function ContactPage() {
  const [state, handleSubmit] = useForm("xykpwyje"); // Replace with your Formspree ID: mjvdykoy

  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const { ref: Submit, inView: sinView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });


  useEffect(() => {
   
    console.log(state);
  }, [state]);



  if (state.succeeded) {
    return (
      <div className="bg-inherit min-h-screen flex items-center justify-center p-5">
        <div className="shadow-lg rounded-xl p-8 w-full max-w-lg text-center bg-white border border-blue-100">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
          <p className="text-slate-600 mb-6">Thank you for reaching out. We'll get back to you as soon as possible.</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-[#191097] text-white font-semibold py-2 rounded-lg hover:bg-[#0b3eb4] transition-all"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-inherit min-h-screen flex items-center justify-center p-5">
      <div className={`shadow-lg rounded-xl p-8 w-full max-w-lg bg-white border border-slate-100 transition-all duration-700 ${inView ? 'opacity-100' : 'opacity-0'}`} ref={ref}>
        <h2 className={`text-2xl font-bold text-blue-600 mb-6 text-center transition-all duration-1000 
          ${inView ? 'opacity-100 translate-y-0' : 'translate-y-4 opacity-0'}`}>
          Contact RiskWhiz
        </h2>

        {state.errors && (

          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center">
            Submission failed. Please check your Formspree ID or internet connection.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="Your Name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="your@email.com"
            />
            <ValidationError
              prefix="Email"
              field="email"
              errors={state.errors}
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              placeholder="How can we help you?"
            />
            <ValidationError
              prefix="Message"
              field="message"
              errors={state.errors}
              className="mt-1 text-sm text-red-500"
            />
          </div>

          <button
            ref={Submit}
            type="submit"
            disabled={state.submitting}
            className={`w-full bg-[#191097] text-white font-semibold py-3 rounded-lg hover:bg-[#0b3eb4] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500
               ${sinView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            {state.submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;

