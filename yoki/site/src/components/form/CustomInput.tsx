import { Input, InputProps, Stack, styled } from "@mui/joy"

export const InputWrapper = styled(Stack, {
    name: "LabsInputWrapper",
})<{ color?: InputProps["color"] }>(({ theme, color }) => ({
    // Stack defaults
    flexDirection: "row",
    alignItems: "center",
    // Styling
    backgroundColor: theme.vars.palette.background.surface,
    border: "solid 1px",
    borderRadius: theme.vars.radius.sm,
    borderColor: theme.vars.palette[color ?? "neutral"].outlinedBorder,
    color: theme.vars.palette[color ?? "neutral"][300],
    // padding: "0 12px",
}));
