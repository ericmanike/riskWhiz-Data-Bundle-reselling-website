'use client';

import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import {
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export default function AgentsPage() {
  const [state, handleFormspreeSubmit] = useForm("xykpwyje"); // Updated with your active working ID
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (state.succeeded) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:pt-28 pt-24 pb-16">
        <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Registration Request Received!</h2>
          <p className="text-slate-600 text-lg mb-8">
            Thank you for applying for the AFA Package. Our team will review your details and contact you shortly regarding the next steps.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Client-side validation
    const form = e.currentTarget;
    const formData = new FormData(form);
    const nextErrors: Record<string, string> = {};

    if (!formData.get('name')) nextErrors.name = 'Full name is required';
    if (!formData.get('phone')) nextErrors.phone = 'Phone number is required';
    if (!formData.get('idType')) nextErrors.idType = 'ID type is required';
    if (!formData.get('idNumber')) nextErrors.idNumber = 'ID number is required';
    if (!formData.get('location')) nextErrors.location = 'Location is required';
    if (!formData.get('region')) nextErrors.region = 'Region is required';
    if (!formData.get('dateOfBirth')) nextErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.get('occupation')) nextErrors.occupation = 'Occupation is required';

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      await handleFormspreeSubmit(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:pt-28 pt-24 pb-16 space-y-10">
      <section
        id="apply"
        className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              AFA Registration
            </h2>
            <div className="text-sm text-slate-600">
              Fill out the form below to register for AFA Package
              <br />
              <h2 className="text-lg font-bold text-blue-600 mt-2">Registration Fee is 50 GHS</h2>
            </div>
          </div>
        </div>

        {state.errors && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium text-center">
            Submission failed. Please check your Formspree ID or internet connection.
          </div>
        )}

        <form className="grid md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
          {Object.keys(errors).length > 0 && (
            <div className="md:col-span-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-medium text-center">
              Please fill in all required fields to continue.
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">Full name</label>
            <input
              id="name"
              name="name"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              placeholder="Ama Mensah"
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
            <ValidationError prefix="Name" field="name" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone number</label>
            <input
              id="phone"
              name="phone"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              placeholder="054XXXXXXX"
            />
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone}</p>}
            <ValidationError prefix="Phone" field="phone" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="idType" className="text-sm font-medium text-slate-700">ID Type</label>
            <select
              id="idType"
              name="idType"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition-all font-medium"
            >
              <option value="">Select ID Type</option>
              <option value="Ghana Card">Ghana Card</option>
              <option value="Voters ID">Voters ID</option>
              <option value="Passport">Passport</option>
              <option value="Drivers License">Drivers License</option>
            </select>
            {errors.idType && <p className="text-xs text-red-500 font-medium">{errors.idType}</p>}
            <ValidationError prefix="ID Type" field="idType" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="idNumber" className="text-sm font-medium text-slate-700">ID Number</label>
            <input
              id="idNumber"
              name="idNumber"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              placeholder="GHA-XXXXXXXXX-X"
            />
            {errors.idNumber && <p className="text-xs text-red-500 font-medium">{errors.idNumber}</p>}
            <ValidationError prefix="ID Number" field="idNumber" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="location" className="text-sm font-medium text-slate-700">Location</label>
            <input
              id="location"
              name="location"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              placeholder="City/Town name"
            />
            {errors.location && <p className="text-xs text-red-500 font-medium">{errors.location}</p>}
            <ValidationError prefix="Location" field="location" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="region" className="text-sm font-medium text-slate-700">Region</label>
            <select
              id="region"
              name="region"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white transition-all font-medium"
            >
              <option value="">Select Region</option>
              <option value="Greater Accra">Greater Accra</option>
              <option value="Ashanti">Ashanti</option>
              <option value="Western">Western</option>
              <option value="Central">Central</option>
              <option value="Eastern">Eastern</option>
              <option value="Northern">Northern</option>
              <option value="Upper East">Upper East</option>
              <option value="Upper West">Upper West</option>
              <option value="Volta">Volta</option>
              <option value="Bono">Bono</option>
              <option value="Bono East">Bono East</option>
              <option value="Ahafo">Ahafo</option>
              <option value="Savannah">Savannah</option>
              <option value="North East">North East</option>
              <option value="Oti">Oti</option>
              <option value="Western North">Western North</option>
            </select>
            {errors.region && <p className="text-xs text-red-500 font-medium">{errors.region}</p>}
            <ValidationError prefix="Region" field="region" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">Date of birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
            />
            {errors.dateOfBirth && <p className="text-xs text-red-500 font-medium">{errors.dateOfBirth}</p>}
            <ValidationError prefix="DOB" field="dateOfBirth" errors={state.errors} />
          </div>

          <div className="space-y-1">
            <label htmlFor="occupation" className="text-sm font-medium text-slate-700">Occupation</label>
            <input
              id="occupation"
              name="occupation"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              placeholder="Your current work"
            />
            {errors.occupation && <p className="text-xs text-red-500 font-medium">{errors.occupation}</p>}
            <ValidationError prefix="Occupation" field="occupation" errors={state.errors} />
          </div>

          <button
            type="submit"
            disabled={state.submitting}
            className="md:col-span-2 w-full md:w-auto px-6 py-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold transition-all flex items-center gap-2 justify-center shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            {state.submitting ? 'Submitting...' : 'Submit Registration'}
            <CheckCircle2 size={18} />
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-600 flex items-center justify-center gap-2 border-t border-slate-100 pt-6">
          Need help? Reach us at{' '}
          <a
            className="text-blue-600 font-bold hover:underline"
            href="mailto:support@riskwhiz.com"
          >
            euginesogtinye@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}



