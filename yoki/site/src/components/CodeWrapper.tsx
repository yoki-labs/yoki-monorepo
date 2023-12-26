import { Box, styled } from "@mui/joy";

const CodeWrapper = styled(Box, {
    name: "CodeWrapper",
})(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.body,
    borderRadius: theme.vars.radius.sm,
    padding: "12px 16px",
}));

export default CodeWrapper;
