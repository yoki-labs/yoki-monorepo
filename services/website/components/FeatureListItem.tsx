import CheckSquare from "./icons/CheckSquare";

export default function FeatureListItem(props: { text: string }) {
    return (
        <p>
            <CheckSquare className="text-xl inline" /> {props.text}
        </p>
    );
}
