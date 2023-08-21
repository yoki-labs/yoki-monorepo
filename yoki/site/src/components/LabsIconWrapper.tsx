import { Box, styled } from "@mui/joy";

const LabsIconWrapper = styled(
    Box,
)(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.level3,
    width: 20,
    height: 20,
    borderRadius: "50%",
    padding: 10,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
}));

export default LabsIconWrapper;