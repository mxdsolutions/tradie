/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0F172A", // Midnight
                    light: "#334155", // Charcoal
                },
                accent: {
                    DEFAULT: "#2563EB", // Electric Blue
                    light: "#EFF6FF", // Soft Blue
                },
                background: {
                    DEFAULT: "#F8FAFC", // Wash
                    paper: "#FFFFFF", // Paper
                },
                status: {
                    success: "#10B981",
                    warning: "#F59E0B",
                    error: "#EF4444",
                },
                text: {
                    primary: "#0F172A",
                    secondary: "#64748B",
                    tertiary: "#94A3B8",
                }
            },
            borderRadius: {
                'xl': '10px',
                '2xl': '14px',
                '3xl': '22px',
            },
            boxShadow: {
                'none': '0 0 0 rgba(0, 0, 0, 0)',
                'sm': '0 0 0 rgba(0, 0, 0, 0)',
                DEFAULT: '0 0 0 rgba(0, 0, 0, 0)',
                'md': '0 0 0 rgba(0, 0, 0, 0)',
                'lg': '0 0 0 rgba(0, 0, 0, 0)',
                'xl': '0 0 0 rgba(0, 0, 0, 0)',
                '2xl': '0 0 0 rgba(0, 0, 0, 0)',
                'soft': '0 0 0 rgba(0, 0, 0, 0)',
                'medium': '0 0 0 rgba(0, 0, 0, 0)',
            }
        },
    },
    plugins: [],
};
