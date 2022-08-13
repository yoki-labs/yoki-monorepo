export default function FeaturePreview(props: { header: string; description: string; src: string; position: "left" | "right" }) {
    return (
        <div className="py-20 md:grid gap-20 grid-cols-2 place-items-center">
            <img src={props.src} className="rounded-lg" />
            <div className={`text-white ${props.position === "left" ? "-order-1" : ""}`}>
                <h1 className="text-3xl font-bold pb-4">{props.header}</h1>
                <p>{props.description}</p>
            </div>
        </div>
    );
}
