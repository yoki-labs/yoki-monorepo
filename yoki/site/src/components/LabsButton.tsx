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
        background: `linear-gradient(to bottom right, ${(color ? buttonColours[color] : buttonColours.primary)?.join(",")}) !important`,
        opacity: disabled ? 0.4 : 1,
        filter: disabled ? "grayscale(65%)" : undefined,
        transition: "0.25s ease-out",
        transitionProperty: "opacity, filter, background",
        "&:hover": {
            background: `linear-gradient(to bottom right, ${(color ? buttonColoursHover[color] : buttonColoursHover.primary)?.join(",")})`
        }
    };
});

export default LabsButton;

// export default function LabsButton(props: ButtonProps) {
//     const colour = props.color ? buttonColours[props.color] : buttonColours.primary;

//     return <Button {...props} />;
// }
