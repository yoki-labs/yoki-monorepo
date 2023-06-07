import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Module(props: { name: string; icon: IconDefinition; description: string; color: string }) {
    return (
        <div className={`card w-96 h-48 shadow-xl ${props.color ?? "bg-red-500"}`}>
            <div className="card-body">
                <div className="flex gap-4">
                    <h2 className="card-title text-white">{props.name}</h2>
                    <FontAwesomeIcon className="w-7" icon={props.icon} />
                </div>
                <p className="text-gray-200">{props.description}</p>
                <div className="card-actions justify-end">
                    <input type="checkbox" className="toggle" />
                </div>
            </div>
        </div>
    );
}
