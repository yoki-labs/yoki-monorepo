export default function StatisticPreview(props: { Icon: any; text: string }) {
    return (
        <p>
            <props.Icon className="text-xl inline" /> {props.text}
        </p>
    );
}
