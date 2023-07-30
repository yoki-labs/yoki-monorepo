import { Button, ButtonProps, styled } from "@mui/joy";
import { DefaultColorPalette } from "@mui/joy/styles/types";
import { labsSecondaryColour, labsSecondaryColourHover } from "../styles/theme";

const buttonColours: Partial<Record<DefaultColorPalette, [string, string]>> = {
    primary: labsSecondaryColour,
};
const buttonColoursHover: Partial<Record<DefaultColorPalette, [string, string]>> = {
    primary: labsSecondaryColourHover,
};

const LabsButton = styled(
    Button,
)(({ theme, color, disabled }) => {
    return {
        backgroundImage: `linear-gradient(to bottom right, ${(color ? buttonColours[color] : buttonColours.primary)?.join(",")}) !important`,
        opacity: disabled ? 0.4 : 1,
        filter: disabled ? "grayscale(65%)" : undefined,
        transition: "0.2s ease-out",
        transitionProperty: "opacity, filter",
        padding: "4px 24px",
        position: "relative",
        borderRadius: theme.vars.radius.sm,
        "::after": disabled ? undefined : {
            content: `""`,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 12,
            backgroundColor: "transparent",
            transition: "background-color 0.2s ease-out"
        },
        "&:hover::after": disabled ? undefined : {
            backgroundColor: "rgba(255, 255, 255, 0.35)",
        },
    };
});

export default LabsButton;

// export default function LabsButton(props: ButtonProps) {
//     const colour = props.color ? buttonColours[props.color] : buttonColours.primary;

//     return <Button {...props} />;
// }
