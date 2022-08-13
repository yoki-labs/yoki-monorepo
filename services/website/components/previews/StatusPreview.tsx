import { Hammer } from "../../styles/components/hammer";
import { StatusWrapper } from "./styles";

export default function StatusPreview(props: { statusTitle: string; statusDescription: string }) {
    return (
        <StatusWrapper>
            <div className="hammer">
                <Hammer></Hammer>
            </div>
            <div className="pl-4">
                <p className="text-lg font-bold text-white">{props.statusTitle}</p>
                <p className="text-sm">{props.statusDescription}</p>
            </div>
        </StatusWrapper>
    );
}
