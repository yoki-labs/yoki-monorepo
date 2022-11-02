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
                        <Link href="/">
                            <a className="link">Home</a>
                        </Link>
                        <Link href="/commands">
                            <a className="link">Commands</a>
                        </Link>
                        <Link href="/premium">
                            <a className="link premium">Premium</a>
                        </Link>
                        <Link href="/invite">
                            <a className="link invite">Get Yoki</a>
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
                        <Link href="/">
                            <a className="link">Home</a>
                        </Link>
                    </SideNavbarItem>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/commands">
                            <a className="link">Commands</a>
                        </Link>
                    </SideNavbarItem>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/premium">
                            <a className="premium">Premium</a>
                        </Link>
                    </SideNavbarItem>
                    <SideNavbarItem onClick={() => toggleSidebar()}>
                        <Link href="/invite">
                            <a className="invite">Get Yoki</a>
                        </Link>
                    </SideNavbarItem>
                </SideNavbarBody>
                <SideNavbarFooter></SideNavbarFooter>
            </SideNavbar>
        </NavbarWrapper>
    );
}
