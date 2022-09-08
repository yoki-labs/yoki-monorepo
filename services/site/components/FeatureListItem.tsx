import CheckSquare from "./icons/CheckSquare";

export default function FeatureListItem(props: { text: string }) {
    return (
        <p className="flex items-center">
            <CheckSquare className="text-xl inline" /> <span className="pl-1">{props.text}</span>
        </p>
    );
}
