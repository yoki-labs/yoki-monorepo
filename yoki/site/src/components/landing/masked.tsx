import { styled } from "@mui/joy";

interface CurvyMaskProps {
    placement?: "top" | "bottom";
    start?: string;
}

export const CurvyMask = styled(`div`, {
    name: "CurvyMask",
})<CurvyMaskProps>(({ theme, placement, start }) => {
    const radialPlacement = placement ?? "top";
    const radialStart = start ?? "50%";

    const mask = `
        radial-gradient(100% ${radialStart} at ${radialPlacement}, white 79.8%, transparent 80%) top left,
        radial-gradient(100% ${radialStart} at ${radialPlacement}, white 79.8%, transparent 80%) top center,
        radial-gradient(100% ${radialStart} at ${radialPlacement}, white 79.8%, transparent 80%) top right
    `;

    return {
        mask,
        maskSize: "33.4% 150%",
        maskRepeat: "no-repeat"
    };
});