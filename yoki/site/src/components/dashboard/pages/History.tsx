import { faAngleLeft, faAngleRight, faBroom, faCircleExclamation, faHammer, faShoePrints, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSetAtom } from "jotai";
import { useState } from "react";

import { tempToastAtom } from "../../../state/toast";
import { actions } from "../../../utils/dummyData";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import LabsOverflowButton from "../../LabsOverflowButton";

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

            <Table>
                <TableHead>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Moderator</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell></TableCell>
                </TableHead>
                <TableBody>
                    {actions.map((action) => (
                        <TableRow data-id={action.id}>
                            <TableCell className="text-spacelight-700">{action.targetId}</TableCell>
                            <TableCell className="text-spacelight-500 font-bold">
                                <FontAwesomeIcon className="w-5 mr-2 text-spacelight-300" icon={getActionIcon(action.type)} />
                                <span>{action.type}</span>
                            </TableCell>
                            <TableCell className="text-spacelight-700">{getReason(action.reason, action.executorId)}</TableCell>
                            <TableCell className="text-spacelight-700">{action.executorId}</TableCell>
                            <TableCell className="text-spacelight-700">{transformToDate(action.createdAt)}</TableCell>
                            <TableCell>
                                <LabsOverflowButton />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
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
