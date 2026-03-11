"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn, signInWithMagicLink } from "@/app/actions/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
            const result = await signIn(formData);
            if (result?.error) {
                toast.error(result.error);
            }
            // If successful, Next.js redirect will be thrown, or we push
        } catch (err: any) {
            toast.error("An error occurred during sign in.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            toast.error("Please enter your email address first");
            return;
        }
        setIsMagicLinkLoading(true);

        const formData = new FormData();
        formData.append("email", email);

        try {
            const result = await signInWithMagicLink(formData);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success(result.success || "Magic link sent!");
            }
        } catch (err: any) {
            toast.error("An error occurred sending the magic link.");
        } finally {
            setIsMagicLinkLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-black font-sans">Welcome Back</h1>
                    <p className="text-gray-500 font-sans">Sign in to your account</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sans"
                            placeholder="name@example.com"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-gray-700 font-sans">Password</label>
                            <Link href="/forgot-password" className="text-sm text-gray-500 hover:text-black hover:underline font-sans">Forgot password?</Link>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sans"
                            placeholder="Enter password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading || isMagicLinkLoading}
                        className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors font-sans disabled:opacity-50"
                    >
                        {isLoading ? "Signing In..." : "Sign In with Password"}
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleMagicLink}
                        disabled={isLoading || isMagicLinkLoading}
                        className="w-full bg-white text-black border border-gray-200 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors font-sans mt-2 disabled:opacity-50"
                    >
                        {isMagicLinkLoading ? "Sending..." : "Send Magic Link"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 font-sans">
                    Don't have an account? <Link href="/signup" className="text-black font-semibold hover:underline">Sign up</Link>
                </p>
            </div>
            <div className="mt-8">
                <Link href="/" className="text-sm text-gray-400 hover:text-black transition-colors font-sans">← Back to Home</Link>
            </div>
        </div>
    );
}
