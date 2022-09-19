import Footer from "./footer/Footer"
import Navbar from "./navbar/navbar"

export const LandingPage = ({ children }: { children: any }) => {
    return <>
        <Navbar />
        {children}
        <div className="bg-[#15171d] px-12 md:px-20">
            <Footer />
        </div></>

}