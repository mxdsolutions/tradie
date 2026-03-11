"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePassword } from "@/app/actions/auth";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("password", password);

        try {
            const result = await updatePassword(formData);
            if (result?.error) {
                toast.error(result.error);
            }
            // Will throw Next redirect on success
        } catch (err: any) {
            toast.error("An error occurred updating the password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
            <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-black font-sans">Set new password</h1>
                    <p className="text-gray-500 font-sans">Please type your new password below</p>
                </div>

                <form className="space-y-4" onSubmit={handleUpdate}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sans"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-sans">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black font-sans"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 transition-colors font-sans disabled:opacity-50"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
