import Image from "next/image";

import NavbarItem from "./navbarItem";

export default function Navbar() {
    return (
        <nav className="flex flex-wrap items-center justify-between py-5 px-5 md:px-20">
            <a href="/" className="flex items-center">
                <div className="whitespace-nowrap pl-2 md:pl-20 my-auto text-4xl md:text-6xl select-none">
                    <Image src="/face.png" className="rounded-full" width="70" height="70" />
                </div>
            </a>

            <div className="flex w-auto text-right text-bold mt-0">
                <ul className="text-white text-lg flex flex-row space-x-14">
                    <NavbarItem text="Home" dest="/" />
                    <NavbarItem text="Features" dest="/features" />
                    <NavbarItem text="Commands" dest="/commands" />
                </ul>
            </div>

            <div className="pr-2 md:pr-16">
                <button type="button" className="text-white text-right border-custom-guilded border-.5 font-medium rounded-md text-lg md:text-md px-6 py-2.5">
                    Invite Now
                </button>
            </div>
        </nav>
    );
}
