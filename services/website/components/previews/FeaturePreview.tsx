export default function FeaturePreview(props: { header: string; description: string; src: string; position: "left" | "right" }) {
    const description =
        props.position === "right" ? (
            <div className="col-span-3 text-white">
                <h1 className="text-3xl font-bold pb-4">{props.header}</h1>
                <p>{props.description}</p>
            </div>
        ) : (
            <div className="col-start-2 col-end-5 text-white">
                <h1 className="text-3xl font-bold pb-4">{props.header}</h1>
                <p>{props.description}</p>
            </div>
        );

    return (
        <div className="py-20 md:grid grid-cols-10 place-items-center">
            {props.position === "left" && description}
            <img className="col-span-6 py-8" src={props.src} width="471" height="143" />
            {props.position === "right" && description}
        </div>
    );
}
