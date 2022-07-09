/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            borderWidth: {
                ".5": ".5px",
            },
            borderColor: {
                custom: {
                    guilded: "#F9D849",
                },
            },
            colors: {
                custom: {
                    "dark-cyan-blue": "#191B1F",
                    guilded: "#F9D849",
                },
            },
        },
    },
    plugins: [],
};
