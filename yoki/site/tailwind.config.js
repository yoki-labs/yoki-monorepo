const withMT = require("@material-tailwind/react/utils/withMT");
const plugin = require("tailwindcss/plugin");

const colors = require("tailwindcss/colors");
delete colors["lightBlue"];
delete colors["warmGray"];
delete colors["trueGray"];
delete colors["coolGray"];
delete colors["blueGray"];

/** @type {import('tailwindcss').Config} */
module.exports = withMT({
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        colors: {
            ...colors,
            spacedark: {
                950: "#06020a",
                900: "#0e0816",
                800: "#15101e",
                700: "#211c2c",
                600: "#2c2737",
                500: "#3d3945",
                400: "#56525e",
                300: "#716e76",
            },
            spacelight: {
                950: "#f9f5fd",
                900: "#efe7f9",
                800: "#e4daf6",
                700: "#d4c7ef",
                600: "#bcafd9",
                500: "#a99cc3",
                400: "#9084a8",
                300: "#7c7094",
            },
        },
        extend: {
            boxShadow: {
                DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.02)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.01)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.01)",
            },
            outline: {
                blue: "2px solid rgba(0, 112, 244, 0.5)",
            },
            fontFamily: {
                inter: ["Inter", "sans-serif"],
            },
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
                    "dark-gray": "#0e0816",
                    gray: "#15101e",
                    guildedGray: "#15171d",
                    guilded: "#F5C400",
                    black: "#111820",
                    gilded: "#F5C400",
                    slate: "#292B32",
                    white: "#ececee",
                },
            },
        },
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    ...require("daisyui/src/colors/themes")["[data-theme=light]"],
                    primary: "#8147ec",
                },
                dark: {
                    ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
                    primary: "#8147ec",
                },
            },
            {
                light: {
                    "base-100": "#f9f5fd",
                    neutral: "#efe7f9",
                    primary: "#8147ec",
                },
                dark: {
                    "base-100": "#06020a",
                    "base-200": "#0e0816",
                    "base-300": "#15101e",
                    neutral: "#0e0816",
                    "neutral-content": "#bcafd9",
                    primary: "#8147ec",
                },
            },
        ],
    },
});
