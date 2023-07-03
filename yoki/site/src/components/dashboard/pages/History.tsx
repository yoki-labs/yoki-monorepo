import { faBroom, faChevronDown, faChevronRight, faCircleExclamation, faHammer, faMagnifyingGlass, faShoePrints, faVolumeMute } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Input, Sheet, Table, Typography } from "@mui/joy";
import type { Action } from "@prisma/client";
import React from "react";

import { actions } from "../../../utils/dummyData";

const actionTypes = {
    MUTE: faVolumeMute,
    BAN: faHammer,
    KICK: faShoePrints,
    WARN: faCircleExclamation,
    SOFTBAN: faBroom,
};

const botId = "mGMEZ8r4";

interface Props { }
interface State {
    expandedRows: string[];
}

export default class History extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { expandedRows: [] };
    }

    toggleRowExpansion(actionId: string) {
        const { expandedRows } = this.state;

        const index = this.state.expandedRows.indexOf(actionId);

        // It doesn't exist, so add it
        if (index < 0) return this.setState({ expandedRows: expandedRows.concat(actionId) });

        // To not mess with the state
        const clone = [...expandedRows];

        clone.splice(index, 1);

        this.setState({ expandedRows: clone });
    }

    renderRow(action: Action) {
        const isExpanded = this.state.expandedRows.includes(action.id);

        return (
            <>
                <tr data-id={action.id}>
                    <td>
                        <IconButton onClick={this.toggleRowExpansion.bind(this, action.id)} color="neutral" aria-label="More button">
                            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                        </IconButton>
                    </td>
                    <td className="text-spacelight-600 font-bold">
                        <Typography startDecorator={<FontAwesomeIcon icon={getActionIcon(action.type)} />} fontWeight="lg" textColor="text.secondary">
                            {action.type}
                        </Typography>
                    </td>
                    <td>
                        <Typography level="body2">{getReason(action.reason, action.executorId)}</Typography>
                    </td>
                    <td>{action.targetId}</td>
                    <td>{action.executorId}</td>
                    <td>
                        <Typography level="body2">{transformToDate(action.createdAt)}</Typography>
                    </td>
                </tr>
                {/* isExpanded is modified by arrow button. This is for showing IDs and whatnot */}
                {isExpanded && this.renderRowInfo(action)}
            </>
        );
    }

    renderRowInfo(action: Action) {
        return (
            <tr data-id={action.id}>
                <td style={{ height: 0, padding: 0 }} colSpan={6}>
                    <Sheet variant="soft" sx={{ p: 1, pl: 6, pr: 6 }}>
                        <Typography level="body2">ID: {action.id}</Typography>
                    </Sheet>
                </td>
            </tr>
        );
    }

    render() {
        return (
            <div>
                {/* <div className="flex flex-col space-y-2 md:space-y-0 mb-6 md:mb-4 md:flex-row md:space-x-2">
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
                </div> */}
                <header>
                    <Input placeholder="Search cases" startDecorator={<FontAwesomeIcon icon={faMagnifyingGlass} />} />
                </header>

                <Table size="lg" variant="plain" sx={{ borderRadius: 8, overflow: "hidden", "--Table-headerUnderlineThickness": 0 }}>
                    <thead>
                        <tr>
                            <th style={{ width: 60 }}></th>
                            <th>Action</th>
                            <th>Reason</th>
                            <th>User</th>
                            <th>Moderator</th>
                            <th>CreatedAt</th>
                        </tr>
                    </thead>
                    <tbody>{actions.map((action) => this.renderRow(action))}</tbody>
                </Table>
            </div>
        );
    }
}

const getActionIcon = (action: string) => {
    return actionTypes[action as keyof typeof actionTypes];
};

const getReason = (reason: string | null, executorId: string) => (executorId === botId && reason?.startsWith("[AUTOMOD]") ? reason.substring(10) : reason);
// {
//     if (reason.startsWith("[AUTOMOD]")) return <span className="py-1 px-2 rounded-lg text-spacelight-800">User violated automod rules</span>;
//     if (reason.length > 40) return `${reason.substring(0, 40)}...`;
//     return reason;
// };

const getExecutor = (executorId: string) => {
    return executorId === botId ? <span className="badge badge-md text-primary font-semibold">Automod</span> : executorId;
};

const transformToDate = (date: Date | null) => {
    return date?.toString().substring(0, 10) ?? "never";
};
