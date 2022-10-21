import Footer from "./footer/Footer";
import Navbar from "./navbar/navbar";

export const LandingPage = ({ children }: { children: any }) => {
    return (
        <>
            <Navbar />
            <div className="bg-custom-gray pb-12">{children}</div>
            <div className="bg-[#15171d] px-12 md:px-20">
                <Footer />
            </div>
        </>
    );
};
