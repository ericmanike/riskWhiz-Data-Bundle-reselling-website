"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError(res.error);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err: any) {
            setError("Too many attempts , try again later");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen overflow-y-auto  px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">

                    <CardTitle className="text-2xl text-slate-950 font-bold">Welcome Back</CardTitle>
                    <p className="text-slate-500 text-sm mt-2">Sign in to your account to continue</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 text-black rounded-lg border border-slate-300 bg-white/10 placeholder-slate-400     focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-600">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 text-black rounded-lg border border-slate-300 bg-white/10 placeholder-slate-400     focus:outline-none focus:ring-2 focus:ring-white transition-all pr-10"
                                    placeholder="Enter your password"
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

                        <div className="text-right">
                            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full  cursor-pointer py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-sm text-slate-500">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="text-blue-600 hover:underline font-bold">
                            Create one
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
