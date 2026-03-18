/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: "#000000", light: "#1a1a1a" },
                accent: { DEFAULT: "#ff751f", light: "#fff0e6" },
                background: { DEFAULT: "#F8FAFC", paper: "#FFFFFF" },
                status: { success: "#10B981", warning: "#F59E0B", error: "#EF4444" },
                text: { primary: "#0F172A", secondary: "#64748B", tertiary: "#94A3B8" },
            },
            borderRadius: { xl: "10px", "2xl": "14px", "3xl": "22px" },
            boxShadow: {
                none: "0 0 0 rgba(0, 0, 0, 0)",
                sm: "0 0 0 rgba(0, 0, 0, 0)",
                DEFAULT: "0 0 0 rgba(0, 0, 0, 0)",
                md: "0 0 0 rgba(0, 0, 0, 0)",
                lg: "0 0 0 rgba(0, 0, 0, 0)",
                xl: "0 0 0 rgba(0, 0, 0, 0)",
                "2xl": "0 0 0 rgba(0, 0, 0, 0)",
                soft: "0 0 0 rgba(0, 0, 0, 0)",
                medium: "0 0 0 rgba(0, 0, 0, 0)",
            },
            fontFamily: {
                bebas: ["BebasNeue_400Regular"],
                roboto: ["Roboto_400Regular", "Roboto_500Medium", "Roboto_700Bold"],
            },
        },
    },
    plugins: [],
};
