import { useSetAtom } from "jotai";

import { tempToastAtom } from "../../../state/toast";
import { actions } from "../../../utils/dummyData";
import { faBroom, faCircleExclamation, faHammer, faShoePrints, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const actionTypes = {
    MUTE: faVolumeMute,
    BAN: faHammer,
    KICK: faShoePrints,
    WARN: faCircleExclamation,
    SOFTBAN: faBroom,
};

const getActionIcon = (action: string) => {
    return actionTypes[action as keyof typeof actionTypes];
};

const getReason = (reason: string) => {
    if (reason.startsWith("[AUTOMOD]")) return <span className="py-1 px-2 bg-primary rounded-lg text-black">User violated automod rules.</span>;
    if (reason.length > 40) return `${reason.substring(0, 40)}...`;
    return reason;
};

const getExecutor = (executorId: string) => {
    return executorId === "mGMEZ8r4" ? <span className="badge badge-md bg-primary text-black font-semibold">Automod</span> : executorId;
};

const transformToDate = (date: string | null) => {
    return date?.substring(0, 10) ?? "never";
};

export default function Automod() {
    const writeToast = useSetAtom(tempToastAtom);

    const alert = (actionId: string) => {
        navigator.clipboard.writeText(actionId);
        writeToast("Copied.");
    };

    return (
        <div>
            <div className="mb-4 flex flex-row space-x-8">
                {Object.keys(actionTypes).map((action) => {
                    return (
                        <div className="flex flex-row space-x-2">
                            <FontAwesomeIcon className="w-6" icon={actionTypes[action as keyof typeof actionTypes]} />
                            <p> = {action[0].toUpperCase() + action.substring(1).toLowerCase()}</p>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-row">
                <div className="form-control mb-2">
                    <label className="label">
                        <span className="label-text">Filter by target users</span>
                    </label>
                    <input type="text" placeholder="Example: pmbOB8VA" className="input input-bordered w-60 input-sm" />
                </div>
                <div className="form-control w-full max-w-xs mb-2">
                    <label className="label">
                        <span className="label-text">Filter by executing users</span>
                    </label>
                    <input type="text" placeholder="Example: pmbOB8VA" className="input input-bordered w-60 input-sm" />
                </div>
                <div className="form-control w-full max-w-xs mb-2">
                    <label className="label">
                        <span className="label-text">Filter by type</span>
                    </label>

                    <div className="grid grid-cols-3 form-control">
                        {Object.keys(actionTypes).map((action) => {
                            return (
                                <div className="flex flex-row space-x-2 mt-1">
                                    <span>{action.toLowerCase()}</span>
                                    <input type="checkbox" value={action} className="checkbox" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto scrollbar">
                <table className="table w-full">
                    {/* head */}
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User Actioned</th>
                            <th>Type</th>
                            <th>Reason</th>
                            <th>Executor</th>
                            <th>Infraction Points</th>
                            <th>Date Issued</th>
                            <th>Date Expires</th>
                        </tr>
                    </thead>
                    <tbody>
                        {actions.map((action) => (
                            <tr className="hover">
                                <th onClick={() => alert(action.id)} className="text-xs hover:cursor-pointer">
                                    {action.id}
                                </th>
                                <td>{action.targetId}</td>
                                <td>
                                    <FontAwesomeIcon className="w-6 text-primary" icon={getActionIcon(action.type)} />
                                </td>
                                <td>{getReason(action.reason)}</td>
                                <td>{getExecutor(action.executorId)}</td>
                                <td>{action.infractionPoints}</td>
                                <td>{transformToDate(action.createdAt)}</td>
                                <td>{transformToDate(action.expiresAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
