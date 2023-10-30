import { Box, Stack, styled } from "@mui/joy";
import Footer from "./Footer";
import Navbar from "./Navbar";
import React from "react";
import { NavbarButtonList } from "./NavbarButton";
import { LabsSessionUser } from "../../utils/pageUtil";

type Props = {
    user?: LabsSessionUser | null;
    children: React.ReactNode;
};
type State = {
    isMenuToggled: boolean;
};

const PageWrapper = styled(Box)(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.body,
    minHeight: "100%",
}));

export default class LandingPage extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            isMenuToggled: false,
        };
    }

    onMenuToggle(isMenuToggled: boolean) {
        return this.setState({ isMenuToggled });
    }

    render() {
        const { user, children } = this.props;
        const { isMenuToggled } = this.state;

        return (
            <PageWrapper>
                {/* Anything here will be fixed */}
                <Navbar onMenuToggle={this.onMenuToggle.bind(this)} menuToggled={isMenuToggled} user={user} />
                {/* Scrollable item */}
                <Box className={isMenuToggled ? `hidden md:block` : ``}>
                    <Box sx={{ minHeight: "100vh", display: "flex" }} component="article">
                        {children}
                    </Box>
                    <Footer />
                </Box>
                <Box className={isMenuToggled ? `h-full block md:hidden` : `hidden`}>
                    <Stack direction="column" gap={2} sx={{ my: 4, mx: 4 }} alignItems="stretch">
                        <NavbarButtonList />
                    </Stack>
                </Box>
            </PageWrapper>
        );
    }
}
