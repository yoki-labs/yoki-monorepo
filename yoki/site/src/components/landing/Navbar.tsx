import { Box, Button, Stack, Typography, styled } from "@mui/joy";
// import Image from "next/image";
// import Link from "next/link";
import { useEffect, useState } from "react";
import Branding from "../Branding";
import { IconDefinition, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
// import { Hamburger, NavbarItemList, NavbarWrapper, SideNavbar, SideNavbarBg, SideNavbarBody, SideNavbarFooter, SideNavbarHeader, SideNavbarItem } from "./styles";

const NavbarWrapper = styled(Stack)(({ theme }) => ({
    position: "sticky",
    top: 0,
    zIndex: "999",
    // width: "100%",
    transition: "0.2s ease",
    padding: "24px 160px",
    borderBottom: `solid 1px ${theme.vars.palette.divider}`,
    backgroundColor: theme.vars.palette.background.backdrop,
}));

function NavbarButton({ text, icon, href, color }: { text: string; icon?: IconDefinition; href: string; color: "primary" | "neutral" | "warning"; }) {
    return (
        <Link href={href}>
            <Button size="lg" startDecorator={icon && <FontAwesomeIcon icon={icon} />} variant="plain" color={color}>
                { text }
            </Button>
        </Link>
    )
}

export default function Navbar() {
    const [scrollY, setScrollY] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };

        // Invoke for onmount y position
        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const isNavbarDetached = scrollY > 80;

    return (
        <NavbarWrapper direction="row">
            {/* Branding */}
            <Box sx={{ flex: "1" }}>
                <Branding />
            </Box>
            <Stack direction="row" gap={2}>
                <NavbarButton
                    text="Supercharge"
                    icon={faBolt}
                    href="/premium"
                    color="warning"
                    />
                <NavbarButton
                    text="Dashboard"
                    href="/dashboard"
                    color="neutral"
                    />
                <NavbarButton
                    text="Commands"
                    href="/commands/general"
                    color="neutral"
                    />
                <NavbarButton
                    text="Docs"
                    href="/docs"
                    color="neutral"
                    />
            </Stack>
        </NavbarWrapper>
    );
}
