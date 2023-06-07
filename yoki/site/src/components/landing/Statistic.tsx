export default function Statistic(props: { subText: string; amount: string; text: string }) {
    return (
        <div className="card flex border-[1px] border-slate-800 bg-custom-guildedGray px-4 md:px-12 py-8">
            <p className="text-xs md:text-sm">{props.subText}</p>
            <h2 className="text-lg md:text-2xl">
                <b>{props.amount}</b> {props.text}
            </h2>
        </div>
    );
}
