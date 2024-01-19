import { Box, Card, CardContent, Stack, Switch, Typography } from "@mui/joy";
import React from "react";
import { SanitizedPreset } from "../../../lib/@types/db";
import LabsForm from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { severityOptions } from "../../../utils/actionUtil";
import { Severity } from "@prisma/client";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";

type Props = {
    serverId: string;
    title: string;
    description: string;
    preset?: SanitizedPreset;
    presetName: string;
    disabled: boolean;
};

type State = {
    isEnabled: boolean;
};

export default class AutomodPreset extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isEnabled: !!props.preset };
    }

    async onToggle(isEnabled: boolean) {
        this.setState({ isEnabled });

        return this.togglePreset(isEnabled ? "POST" : "DELETE");
    }

    async togglePreset(method: string) {
        const { serverId, presetName } = this.props;

        return fetch(`/api/servers/${serverId}/presets/${presetName}`, {
            method,
            headers: { "content-type": "application/json" },
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while toggling presets"));
    }

    async onPresetUpdate(severity: Severity, infractionPoints: number) {
        const { serverId, presetName } = this.props;

        return fetch(`/api/servers/${serverId}/presets/${presetName}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ severity, infractionPoints }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating preset data"));
    }

    render() {
        const { title, description, preset, disabled } = this.props;
        const { isEnabled } = this.state;

        return (
            <Card>
                <CardContent>
                    <LabsForm
                        sections={[
                            {
                                order: LabsFormSectionOrder.Row,
                                fields: [
                                    {
                                        type: LabsFormFieldType.Select,
                                        name: "Severity",
                                        prop: "severity",
                                        selectableValues: severityOptions,
                                        defaultValue: preset?.severity ?? Severity.WARN,
                                        disabled: disabled || !isEnabled,
                                    },
                                    {
                                        type: LabsFormFieldType.Number,
                                        name: "Infraction points",
                                        prop: "infractionPoints",
                                        placeholder: "A whole number",
                                        defaultValue: preset?.infractionPoints ?? 5,
                                        disabled: disabled || !isEnabled,
                                        min: 0,
                                        max: 10000,
                                    },
                                ],
                            },
                        ]}
                        onSubmit={({ severity, infractionPoints }) => this.onPresetUpdate(severity as Severity, infractionPoints as number)}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Stack gap={4} direction="row">
                                <Typography className="grow" fontWeight="md" level="title-md">
                                    {title}
                                </Typography>
                                <Switch
                                    className="toggle justify-end"
                                    disabled={disabled}
                                    defaultChecked={isEnabled}
                                    checked={isEnabled}
                                    onChange={({ target }) => this.onToggle(target.checked)}
                                />
                            </Stack>
                            <Typography level="body-md">{description}</Typography>
                        </Box>
                    </LabsForm>
                </CardContent>
            </Card>
        );
    }
}
