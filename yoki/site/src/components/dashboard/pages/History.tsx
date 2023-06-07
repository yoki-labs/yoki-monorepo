import { faAngleLeft, faAngleRight, faBroom, faCircleExclamation, faHammer, faShoePrints, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSetAtom } from "jotai";
import { useState } from "react";

import { tempToastAtom } from "../../../state/toast";
import { actions } from "../../../utils/dummyData";

const actionTypes = {
    MUTE: faVolumeMute,
    BAN: faHammer,
    KICK: faShoePrints,
    WARN: faCircleExclamation,
    SOFTBAN: faBroom,
};

const botId = "mGMEZ8r4";

export default function History() {
    const writeToast = useSetAtom(tempToastAtom);
    const [showIds, setShowIds] = useState(false);

    const alert = (actionId: string) => {
        navigator.clipboard.writeText(actionId);
        writeToast("Copied.");
    };

    return (
        <div>
            <div className="flex flex-col space-y-2 md:space-y-0 mb-6 md:mb-4 md:flex-row md:space-x-2">
                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text">Filter by target users</span>
                    </label>
                    <input type="text" placeholder="Example: pmbOB8VA" className="input input-bordered w-60 input-sm" />
                </div>
                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text">Filter by executing users</span>
                    </label>
                    <input type="text" placeholder="Example: pmbOB8VA" className="input input-bordered w-60 input-sm" />
                </div>
                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text">Filter by type</span>
                    </label>

                    <div className="w-full place-items-start grid grid-cols-3 form-control">
                        {Object.keys(actionTypes).map((action) => {
                            return (
                                <div key={action} className="flex flex-row space-x-2 mt-1">
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
                            <th className="flex flex-row">
                                <p className="mr-2">ID</p>
                                <input type="checkbox" checked={showIds} onChange={() => setShowIds(!showIds)} className="checkbox checkbox-md md:checkbox-xs" />
                            </th>
                            <th>User Actioned</th>
                            <th>Type</th>
                            <th>Reason</th>
                            <th>Executor</th>
                            <th>Infraction Points</th>
                            <th>Date Issued</th>
                            <th>Date Expires</th>
                        </tr>
                    </thead>
                    <tbody className="text-spacelight-400">
                        {actions.map((action) => (
                            <tr key={action.id} className="hover">
                                <th onClick={() => alert(action.id)} className="text-xs hover:cursor-pointer">
                                    {showIds ? action.id : "Click to copy"}
                                </th>
                                <td>{action.targetId}</td>
                                <td>
                                    <div className="tooltip" data-tip={action.type}>
                                        <FontAwesomeIcon className="w-5 mr-2 text-yellow-400" icon={getActionIcon(action.type)} />
                                    </div>
                                </td>
                                <td className="text-spacelight-700">{getReason(action.reason, action.executorId)}</td>
                                <td>{getExecutor(action.executorId)}</td>
                                <td>{action.infractionPoints}</td>
                                <td>{transformToDate(action.createdAt)}</td>
                                <td>{transformToDate(action.expiresAt)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="mt-12 flex flex-col content-center items-center">
                <div className="btn-group">
                    <button className="btn inactive">
                        <FontAwesomeIcon className="w-2" icon={faAngleLeft} />
                    </button>
                    <button className="btn active">1</button>
                    <button className="btn">2</button>
                    <button className="btn">3</button>
                    <button className="btn">4</button>
                    <button className="btn">
                        <FontAwesomeIcon className="w-2" icon={faAngleRight} />
                    </button>
                </div>
            </footer>
        </div>
    );
}

const getActionIcon = (action: string) => {
    return actionTypes[action as keyof typeof actionTypes];
};

const getReason = (reason: string, executorId: string) => (executorId === botId && reason.startsWith("[AUTOMOD]") ? reason.substring(10) : reason);
// {
//     if (reason.startsWith("[AUTOMOD]")) return <span className="py-1 px-2 rounded-lg text-spacelight-800">User violated automod rules</span>;
//     if (reason.length > 40) return `${reason.substring(0, 40)}...`;
//     return reason;
// };

const getExecutor = (executorId: string) => {
    return executorId === botId ? <span className="badge badge-md text-primary font-semibold">Automod</span> : executorId;
};

const transformToDate = (date: string | null) => {
    return date?.substring(0, 10) ?? "never";
};
