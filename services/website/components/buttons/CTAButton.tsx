export default function CTAButton(props: { bgColor?: "gradient"; text: string; link: string }) {
    const bgColor = props.bgColor === "gradient" ? "from-[#F3B741] to-[#DFC546] text-black" : "border-[.5px] border-custom-guilded text-white";
    return (
        <div className="pb-2">
            <a href={props.link}>
                <button className={`transition ease-in-out hover:scale-110 px-14 py-3 bg-gradient-to-r rounded-md ${bgColor} whitespace-nowrap`}>{props.text}</button>
            </a>
        </div>
    );
}
