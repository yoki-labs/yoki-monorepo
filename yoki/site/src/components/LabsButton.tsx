import { Button, ButtonProps, styled } from "@mui/joy";
import { DefaultColorPalette } from "@mui/joy/styles/types";
import { labsSecondaryColour, labsSecondaryColourHover } from "../styles/theme";

const buttonColours: Partial<Record<DefaultColorPalette, [string, string]>> = {
    primary: labsSecondaryColour,
};

const LabsButton = styled(
    Button,
)(({ theme, color, disabled }) => {
    const assignedColours = color ? buttonColours[color] : buttonColours.primary;
    return {
        backgroundImage: `linear-gradient(to bottom right, ${assignedColours?.join(",")}) !important`,
        opacity: disabled ? 0.5 : 1,
        filter: disabled ? "grayscale(70%)" : undefined,
        transition: "0.2s ease-out",
        transitionProperty: "opacity, filter",
        padding: "4px 24px",
        position: "relative",
        borderRadius: theme.vars.radius.sm,
        boxShadow: `-2px -2px 20px ${assignedColours?.[0]}77, 2px 2px 20px ${assignedColours?.[1]}77`,
        "::after": disabled ? undefined : {
            content: `""`,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: theme.vars.radius.sm,
            backgroundColor: "transparent",
            transition: "background-color 0.2s ease-out"
        },
        "&:hover::after": disabled ? undefined : {
            backgroundColor: "rgba(255, 255, 255, 0.30)",
        },
        "&:active::after": disabled ? undefined : {
            backgroundColor: "rgba(255, 255, 255, 0.50)",
        },
    };
});

export default LabsButton;
