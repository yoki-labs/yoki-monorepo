import { Box, IconButton, Stack, styled } from "@mui/joy";
// import Image from "next/image";
// import Link from "next/link";
import Branding from "../Branding";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NavbarButton, { NavbarButtonList } from "./NavbarButton";
import UserManager from "../UserManager";
import { LabsSessionUser } from "../../utils/pageUtil";
import { NextRouter, useRouter } from "next/router";
// import { Hamburger, NavbarItemList, NavbarWrapper, SideNavbar, SideNavbarBg, SideNavbarBody, SideNavbarFooter, SideNavbarHeader, SideNavbarItem } from "./styles";

type Props = {
    menuToggled: boolean;
    onMenuToggle: (enabled: boolean) => unknown;
    user?: LabsSessionUser | null;
};

const NavbarWrapper = styled(Stack)(({ theme }) => ({
    position: "sticky",
    top: 0,
    zIndex: "999",
    // width: "100%",
    transition: "0.2s ease",
    //padding: "24px 160px",
    borderBottom: `solid 1px ${theme.vars.palette.divider}`,
    backgroundColor: theme.vars.palette.background.backdrop,
}));

export default function Navbar({ user, menuToggled, onMenuToggle }: Props) {
    // const [scrollY, setScrollY] = useState(0);
    // const [sidebarOpen, setSidebarOpen] = useState(false);

    // useEffect(() => {
    //     const handleScroll = () => {
    //         setScrollY(window.scrollY);
    //     };

    //     // Invoke for onmount y position
    //     handleScroll();

    //     window.addEventListener("scroll", handleScroll);

    //     return () => {
    //         window.removeEventListener("scroll", handleScroll);
    //     };
    // }, []);

    // const isNavbarDetached = scrollY > 80;

    return (
        <NavbarWrapper direction="row" className="py-4 px-8 md:py-6 md:px-40">
            {/* Branding */}
            <Stack sx={{ flex: "1" }} alignItems="center" direction="row">
                <Branding />
            </Stack>
            <Stack direction="row" gap={2} className="hidden md:flex">
                <NavbarButtonList />
                {/* {user ? <UserManager user={user} /> : <NavbarButton text="Login" color="primary" href="/auth/signin?callbackUrl=%2F" />} */}
                <UserManager user={user} />
            </Stack>
            <div className="block md:hidden">
                <IconButton variant="plain" color="neutral" onClick={() => onMenuToggle(!menuToggled)}>
                    <FontAwesomeIcon icon={faBars} />
                </IconButton>
            </div>
        </NavbarWrapper>
    );
}
