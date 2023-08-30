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
        <NavbarWrapper direction="row" sx={(theme) => ({ backgroundColor: isNavbarDetached ? theme.vars.palette.background.level1 : "transparent" })}>
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
        // <NavbarWrapper className={`${scrollY > 20 ? "scrolled" : ""} bg-custom-gray`}>
        //     <nav>
        //         <div className="wrapper">
        //             <Link href="/">
        //                 <div className="cursor-pointer flex select-none">
        //                     <Image src="/face.png" width="54" height="54" alt="Yoki Face" />
        //                 </div>
        //             </Link>
        //             <NavbarItemList>
        //                 <Link href="/" className="nav-link no-underline">
        //                     Home
        //                 </Link>
        //                 <Link href="/commands" className="no-underline">
        //                     Commands
        //                 </Link>
        //                 <Link href="/premium" className="nav-link premium no-underline">
        //                     Premium
        //                 </Link>
        //                 <Link href="/invite" className="nav-link invite no-underline">
        //                     Get Yoki
        //                 </Link>
        //             </NavbarItemList>
        //             <Hamburger onClick={() => toggleSidebar()}>
        //                 <span></span>
        //                 <span></span>
        //                 <span></span>
        //             </Hamburger>
        //         </div>
        //     </nav>
        //     <SideNavbarBg className={sidebarOpen ? "opened " : ""} onClick={() => toggleSidebar()}></SideNavbarBg>
        //     <SideNavbar className={sidebarOpen ? "opened " : ""}>
        //         <SideNavbarHeader>
        //             <SideNavbarItem className="flex justify-between header">
        //                 <div className="flex gap-2 items-center">
        //                     <Image src="/face.png" className="rounded-full" width="50" height="50" alt="Yoki Face" />
        //                     <span className="text-white text-2xl">Yoki</span>
        //                 </div>
        //                 <Hamburger className={sidebarOpen ? "sidenav opened" : "sidenav"} onClick={() => toggleSidebar()}>
        //                     <span></span>
        //                     <span></span>
        //                     <span></span>
        //                 </Hamburger>
        //             </SideNavbarItem>
        //         </SideNavbarHeader>
        //         <SideNavbarBody className={sidebarOpen ? "opened " : ""}>
        //             <SideNavbarItem onClick={() => toggleSidebar()}>
        //                 <Link href="/" className="link">
        //                     Home
        //                 </Link>
        //             </SideNavbarItem>
        //             <SideNavbarItem onClick={() => toggleSidebar()}>
        //                 <Link href="/commands" className="link">
        //                     Commands
        //                 </Link>
        //             </SideNavbarItem>
        //             <SideNavbarItem onClick={() => toggleSidebar()}>
        //                 <Link href="/premium" className="premium">
        //                     Premium
        //                 </Link>
        //             </SideNavbarItem>
        //             <SideNavbarItem onClick={() => toggleSidebar()}>
        //                 <Link href="/invite" className="invite">
        //                     Get Yoki
        //                 </Link>
        //             </SideNavbarItem>
        //         </SideNavbarBody>
        //         <SideNavbarFooter></SideNavbarFooter>
        //     </SideNavbar>
        // </NavbarWrapper>
    );
}
