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
                950: "#0e0a10",
                900: "#150e1a",
                800: "#1e1524",
                700: "#271c2e",
                600: "#32253a",
                500: "#3f3148",
                400: "#53455c",
                300: "#66576f",
            },
            spacelight: {
                950: "#fcfafd",
                900: "#e5e0e8",
                800: "#b5afb9",
                700: "#938a99",
                600: "#796d82",
                500: "#66576f",
                400: "#53455c",
                300: "#3f3148",
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
                    ...require("daisyui/src/theming/themes")["[data-theme=light]"],
                    primary: "#8147ec",
                },
                dark: {
                    ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
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
