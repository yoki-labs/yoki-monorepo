export default function Button(props: { children: React.ReactNode; color?: string; bold?: string; disabled?: boolean }) {
    const colorName: string = props.color ?? "gilded";
    let className = "px-4 py-1 rounded text-lg hover:shadow-2xl transition-shadow hover:cursor-pointer ";

    if (props.bold === "true") className += "font-bold ";

    switch (colorName) {
        case "gilded":
            className += "bg-custom-gilded text-custom-black";
            break;
        case "black":
            className += "bg-black text-custom-white";
            break;
        case "red":
            className += "bg-red-500 text-custom-black";
            break;
        default:
            break;
    }
    return <button disabled={props.disabled ?? false} className={className} {...props} />;
}
