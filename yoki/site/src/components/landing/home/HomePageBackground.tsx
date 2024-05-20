import { styled } from "@mui/joy";

export const HomePageBackground = styled(`div`, {
    name: "HomePageBackground",
    slot: "root",
})(({ theme }) => ({
    opacity: 0.17,
    overflow: "hidden",
    position: "absolute",
    zIndex: 0,
    userSelect: "none",
    pointerEvents: "none",
    background: `linear-gradient(to right, ${theme.vars.palette.background.body}, #9e52fd55, #c452fd55, #5261fd66, ${theme.vars.palette.background.body})`,
    width: "100%",
    height: "1024px",
    "::after": {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 1,
        content: `""`,
        display: "block",
        width: "100%",
        height: "100%",
        background: `linear-gradient(to bottom, #0000, ${theme.vars.palette.background.body})`,
    },
}));
