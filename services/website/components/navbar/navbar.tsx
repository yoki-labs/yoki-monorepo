import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Hamburger, NavbarItemList, NavbarWrapper } from "./styles";

export default function Navbar() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleSroll = () => {
            setScrollY(window.scrollY);
        };

        // Invoke for onmount y position
        handleSroll();

        window.addEventListener("scroll", handleSroll);

        return () => {
            window.removeEventListener("scroll", handleSroll);
        };
    }, []);

    return (
        <NavbarWrapper>
            <nav>
                <div className={scrollY > 20 ? "wrapper scrolled" : "wrapper"}>
                    <Link href="/">
                        <div className="select-none">
                            <Image src="/face.png" className="rounded-full transition" width="70" height="70" alt="Yoki Face" />
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
                            <a className="link invite">Invite</a>
                        </Link>
                    </NavbarItemList>
                    <Hamburger></Hamburger>
                </div>
            </nav>
        </NavbarWrapper>
    );
}
