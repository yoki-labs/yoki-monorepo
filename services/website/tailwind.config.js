const withMT = require("@material-tailwind/react/utils/withMT");

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
    content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            borderWidth: {
                ".5": ".5px",
            },
            borderColor: {
                custom: {
                    guilded: "#F5C400",
                },
            },
            colors: {
                custom: {
                    "dark-gray": "#191B1F",
                    gray: "#202227",
                    guilded: "#F5C400",
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
});
