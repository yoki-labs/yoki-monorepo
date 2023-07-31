import { faChevronDown, faChevronRight, faDroplet, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Button, IconButton, Sheet, Stack, Typography } from "@mui/joy";
import { Action, Severity } from "@prisma/client";
import { formatDate } from "@yokilabs/utils";
import React from "react";
import { severityToIcon } from "../../../utils/actionUtil";
import { CSSProperties } from "styled-components";
import { LabsCopyInput } from "../../LabsCopyInput";
import { SanitizedAction } from "../../../lib/@types/db";
import { LabsUserCard } from "../../LabsUserCard";
import CodeWrapper from "../../CodeWrapper";
import InfoText from "../../InfoText";

type Props = {
    action: SanitizedAction;
    timezone: string | null;
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
                    <Sheet variant="soft" sx={{ m: 1, borderRadius: 8, p: 2, pl: 4, pr: 4 }}>
                        <Stack gap={3}>
                            <Box>
                                <Typography level="h2" fontSize="md" gutterBottom>Reason</Typography>
                                <CodeWrapper>
                                    <Typography textColor="text.secondary">
                                        {action.reason}
                                    </Typography>
                                </CodeWrapper>
                            </Box>
                            {action.triggerContent &&
                                <Box>
                                    <Typography level="h2" fontSize="md" gutterBottom>Triggering content</Typography>
                                    <CodeWrapper>
                                        <Typography textColor="text.secondary">
                                            {action.triggerContent}
                                        </Typography>
                                    </CodeWrapper>
                                </Box>
                            }
                            <Box>
                                <Typography level="h3" fontSize="md" gutterBottom>Identifier</Typography>
                                <LabsCopyInput text={action.id} sx={{ width: "max-content" }} />
                            </Box>
                            {(action.infractionPoints || action.expiresAt) && <Box>
                                { action.infractionPoints && <InfoText icon={faDroplet} name="Infraction points">{action.infractionPoints}</InfoText> }
                                { action.expiresAt && <InfoText icon={faDroplet} name="Infraction points">{formatDate(new Date(action.expiresAt))}</InfoText> }
                            </Box>}
                            <Box>
                                <Typography level="h3" fontSize="md" gutterBottom>Actions</Typography>
                                <Button startDecorator={<FontAwesomeIcon icon={faTrash} />} variant="outlined" color="danger">Delete case</Button>
                            </Box>
                        </Stack>
                    </Sheet>
                </td>
            </tr>
        );
    }

    render() {
        const { action, timezone } = this.props;
        const { isExpanded } = this.state;
        const reason = getReason(action.reason, action.executorId);

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
                        <Typography level="body2">{reason && reason.length > 32 ? `${reason?.slice(0, 32)}...` : reason}</Typography>
                    </td>
                    <td>
                        <LabsUserCard userId={action.targetId} />
                    </td>
                    <td>
                        <LabsUserCard userId={action.executorId} />
                    </td>
                    <td>
                        <Typography level="body2">{formatDate(new Date(action.createdAt), timezone)}</Typography>
                    </td>
                </tr>
                {/* isExpanded is modified by arrow button. This is for showing IDs and whatnot */}
                {isExpanded && this.renderInfoRow()}
            </>
        );
    }
}

const getReason = (reason: string | null, executorId: string) => (executorId === botId && reason?.startsWith("[AUTOMOD]") ? reason.substring(10) : reason);
