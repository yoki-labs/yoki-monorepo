export default function FeaturePreview(props: { header: string; shortHeader: string; description: string; src: string; position: "left" | "right" }) {
    return (
        <div className="py-10 md:py-20 md:grid gap-20 grid-cols-2 place-items-center">
            <div className="text-white">
                <h1 className="text-4xl font-bold pb-2">{props.header}</h1>
                <h2 className="text-xl text-grey-500 font-bold capitalize pb-2">{props.shortHeader}</h2>
                <p>{props.description}</p>
            </div>
            <img src={props.src} className={`rounded-lg pt-4 md:pt-0  ${props.position === "left" ? "-order-1" : ""}`} />
        </div>
    );
}
