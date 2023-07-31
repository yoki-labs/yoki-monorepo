import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconButton, Sheet, Typography } from "@mui/joy";
import { Action } from "@prisma/client";
import { formatDate } from "@yokilabs/utils";
import React from "react";
import { severityToIcon } from "../../../utils/actionUtil";
import { CSSProperties } from "styled-components";
import { LabsCopyInput } from "../../LabsCopyInput";

type Props = {
    action: Action;
};

type State = {
    isExpanded: boolean;
};

const botId = "mGMEZ8r4";

export default class HistoryCase extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isExpanded: false };
    }

    toggleExpanded() {
        const { isExpanded } = this.state;

        this.setState({ isExpanded: !isExpanded });
    }

    renderInfoRow() {
        const { action } = this.props;

        return (
            <tr data-id={action.id}>
                <td style={{ height: 0, padding: 0 }} colSpan={6}>
                    <Sheet variant="soft" sx={{ m: 1, borderRadius: 4, p: 1, pl: 6, pr: 6 }}>
                        <Typography level="h3" fontSize="sm" gutterBottom>Identifier</Typography>
                        <LabsCopyInput text={action.id} />
                    </Sheet>
                </td>
            </tr>
        );
    }

    render() {
        const { action } = this.props;
        const { isExpanded } = this.state;

        return (
            <>
                <tr data-id={action.id} style={{ "--TableCell-borderColor": isExpanded ? "transparent" : undefined } as unknown as CSSProperties}>
                    <td>
                        <IconButton onClick={this.toggleExpanded.bind(this)} color="neutral" aria-label="More button">
                            <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
                        </IconButton>
                    </td>
                    <td>
                        <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[action.type]} />} fontWeight="lg" textColor="text.secondary">
                            {action.type}
                        </Typography>
                    </td>
                    <td>
                        <Typography level="body2">{getReason(action.reason, action.executorId)}</Typography>
                    </td>
                    <td>{action.targetId}</td>
                    <td>{action.executorId}</td>
                    <td>
                        <Typography level="body2">{formatDate(action.createdAt)}</Typography>
                    </td>
                </tr>
                {/* isExpanded is modified by arrow button. This is for showing IDs and whatnot */}
                {isExpanded && this.renderInfoRow()}
            </>
        );
    }
}

const getReason = (reason: string | null, executorId: string) => (executorId === botId && reason?.startsWith("[AUTOMOD]") ? reason.substring(10) : reason);
// {
//     if (reason.startsWith("[AUTOMOD]")) return <span className="py-1 px-2 rounded-lg text-spacelight-800">User violated automod rules</span>;
//     if (reason.length > 40) return `${reason.substring(0, 40)}...`;
//     return reason;
// };

const getExecutor = (executorId: string) => {
    return executorId === botId ? <span className="badge badge-md text-primary font-semibold">Automod</span> : executorId;
};