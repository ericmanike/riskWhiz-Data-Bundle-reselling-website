"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            router.push("/auth/login?registered=true");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen overflow-y-auto  px-4" >
            <Card className="w-full max-w-md ">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <UserPlus size={24} />
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Create Account</CardTitle>
                    <p className="text-slate-500 text-sm mt-2">Join us to start trading</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100 w-full text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-black rounded-lg border border-slate-300 bg-white/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-black rounded-lg border border-slate-300 bg-white/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Phone Number</label>
                            <input
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 text-black rounded-lg border border-slate-300 bg-white/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                placeholder="024XXXXXXX"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Password</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 text-black rounded-lg border border-slate-300 bg-white/10 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white transition-all pr-10"
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-blue-600 hover:underline font-bold">
                            Sign In
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div >
    );
}
