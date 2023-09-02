import { Box, styled } from "@mui/joy";
import Footer from "./Footer";
import Navbar from "./Navbar";

const PageWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.body,
}));

export const LandingPage = ({ children }: { children: React.ReactNode }) => {
    return (
        <PageWrapper>
            {/* Anything here will be fixed */}
            <Navbar />
            {/* Scrollable item */}
            <Box>
                <Box sx={{ minHeight: "100vh" }} component="article">
                    {children}
                </Box>
                <Footer />
            </Box>
        </PageWrapper>
    );
};
