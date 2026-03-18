/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require("@tradie/tailwind-config")],
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "../../packages/shared-ui/**/*.{js,jsx,ts,tsx}",
    ],
};
