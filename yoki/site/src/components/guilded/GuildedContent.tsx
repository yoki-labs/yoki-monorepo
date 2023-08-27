import { Box, styled } from "@mui/joy"

const GuildedContent = styled(Box, {
    name: "GuildedContent",
})(({ theme }) => ({
    border: `solid 1px ${theme.vars.palette.neutral.outlinedBorder}`,
    backgroundColor: theme.vars.palette.background.body,
    padding: `24px 32px`,
    borderRadius: theme.vars.radius.md,
    userSelect: "none",
}));

export default GuildedContent;