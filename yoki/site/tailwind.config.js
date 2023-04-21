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
                    "dark-gray": "#191B1F",
                    gray: "#191B1F",
                    guilded: "#F5C400",
                    black: "#111820",
                    gilded: "#F5C400",
                    slate: "#292B32",
                    white: "#ececee"
                },
            },
        },
    },
    plugins: [
        require("daisyui")
    ],
    daisyui: {
        themes: [
          {
            light: {
              ...require("daisyui/src/colors/themes")["[data-theme=light]"],
              primary: "#F5C400",
            },
            dark: {
                ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
                primary: "#F5C400",
            },
          },
        ],
      },
});
