import { Sheet, styled } from "@mui/joy";

const CodeWrapper = styled(
    Sheet
)(({ theme }) => ({
    backgroundColor: theme.vars.palette.neutral[900],
    borderRadius: theme.vars.radius.sm,
    padding: "12px 16px",
}));

export default CodeWrapper;