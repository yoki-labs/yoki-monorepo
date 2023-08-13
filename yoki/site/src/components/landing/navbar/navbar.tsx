import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Hamburger, NavbarItemList, NavbarWrapper, SideNavbar, SideNavbarBg, SideNavbarBody, SideNavbarFooter, SideNavbarHeader, SideNavbarItem } from "./styles";

export default function Navbar() {
    const [scrollY, setScrollY] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

    return (
        <NavbarWrapper className={`${scrollY > 20 ? "scrolled" : ""} bg-custom-gray`}>
            <nav>
                <div className="wrapper">
                    <Link href="/">
                        <div className="cursor-pointer flex select-none">
                            <Image src="/face.png" className="rounded-full" width="54" height="54" alt="Yoki Face" />
                        </div>
                    </Link>
                    <NavbarItemList>
                        <Link href="/" className="no-underline nav-link">
                            Home
                        </Link>
                        <Link href="/commands" className="no-underline nav-link">
                            Commands
                        </Link>
                        <Link href="/premium" className="no-underline nav-link premium">
                            Premium
                        </Link>
                        <Link href="/invite" className="no-underline nav-link invite">
                            Get Yoki
                        </Link>
                    </NavbarItemList>
                    <Hamburger onClick={() => toggleSidebar()}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </Hamburger>
                </div>
            </nav>
            <SideNavbarBg className={sidebarOpen ? "opened " : ""} onClick={() => toggleSidebar()}></SideNavbarBg>
            <SideNavbar className={sidebarOpen ? "opened " : ""}>
                <SideNavbarHeader>
                    <SideNavbarItem className="flex justify-between header">
                        <div className="flex gap-2 items-center">
                            <Image src="/face.png" className="rounded-full" width="50" height="50" alt="Yoki Face" />
                            <span className="text-white text-2xl">Yoki</span>
                        </div>
                        <Hamburger className={sidebarOpen ? "sidenav opened" : "sidenav"} onClick={() => toggleSidebar()}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </Hamburger>
                    </SideNavbarItem>
                </SideNavbarHeader>
                <SideNavbarBody className={sidebarOpen ? "opened " : ""}>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/" className="link">
                            Home
                        </Link>
                    </SideNavbarItem>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/commands" className="link">
                            Commands
                        </Link>
                    </SideNavbarItem>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/premium" className="premium">
                            Premium
                        </Link>
                    </SideNavbarItem>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/invite" className="invite">
                            Get Yoki
                        </Link>
                    </SideNavbarItem>
                </SideNavbarBody>
                <SideNavbarFooter></SideNavbarFooter>
            </SideNavbar>
        </NavbarWrapper>
    );
}
