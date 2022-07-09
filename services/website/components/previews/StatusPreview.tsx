export default function StatusPreview(props: { statusTitle: string; statusDescription: string }) {
    return (
        <div className="pl-8 bg-gradient-to-r py-4 from-[#202227] to-[#20222776] space-y-1">
            <p className="text-lg font-bold text-white">{props.statusTitle}</p>
            <p className="text-sm">{props.statusDescription}</p>
        </div>
    );
}
