import { Alert, Box, Stack, styled, Link, Typography } from "@mui/joy";
import Footer from "./Footer";
import Navbar from "./Navbar";
import React from "react";
import NavbarButton, { NavbarButtonList } from "./NavbarButton";
import { LabsSessionUser } from "../../utils/routes/pages";
import UserManager from "../UserManager";

type Props = {
    user?: LabsSessionUser | null;
    children: React.ReactNode;
};
type State = {
    isMenuToggled: boolean;
};

const PageWrapper = styled(Box, {
    name: "PageWrapper",
})(({ theme }) => ({
    backgroundColor: theme.vars.palette.background.body,
    minHeight: "100%",
    position: "relative",
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
{/*                 <Alert color="danger">
                    <Typography level="h3" textColor="danger.300">
                        <Link color="neutral" underline="always" textColor="text.primary" href="https://www.guilded.gg/Yoki/blog/News/Shutdown-Complete">Yoki has shut down.</Link> Thank you all for the amazing journey.
                    </Typography>
                </Alert> */}

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
                        {user ? <UserManager user={user} displayName /> : <NavbarButton text="Login" color="primary" href="/auth/signin?callbackUrl=%2F" />}
                    </Stack>
                </Box>
            </PageWrapper>
        );
    }
}
