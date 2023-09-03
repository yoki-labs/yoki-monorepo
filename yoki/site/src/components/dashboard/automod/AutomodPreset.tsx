import { Box, Card, CardContent, Stack, Switch, Typography } from "@mui/joy";
import React from "react";
import { SanitizedPreset } from "../../../lib/@types/db";
import LabsForm from "../../LabsForm";
import { LabsFormFieldType } from "../../form";
import { severityOptions } from "../../../utils/actionUtil";
import { Severity } from "@prisma/client";

type Props = {
    title: string;
    description: string;
    preset?: SanitizedPreset;
    presetName: string;
};

type State = {
    isEnabled: boolean;
};

export default class AutomodPreset extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = { isEnabled: !!props.preset };
    }

    onToggle(isEnabled: boolean) {
        console.log("Preset value changed", [isEnabled]);

        this.setState({ isEnabled });
    }

    render() {
        const { title, description, preset } = this.props;
        const { isEnabled } = this.state;

        return (
            <Card>
                <CardContent>
                    <LabsForm
                        sections={[
                            {
                                row: true,
                                fields: [
                                    {
                                        type: LabsFormFieldType.Select,
                                        name: "Severity",
                                        prop: "severity",
                                        selectableValues: severityOptions,
                                        defaultValue: preset?.severity ?? Severity.WARN,
                                        disabled: !isEnabled,
                                    },
                                    {
                                        type: LabsFormFieldType.Number,
                                        name: "Infraction Points",
                                        prop: "infractions",
                                        placeholder: "A whole number",
                                        defaultValue: preset?.infractionPoints ?? 5,
                                        disabled: !isEnabled,
                                        min: 0,
                                        max: 10000,
                                    }
                                ]
                            }
                        ]}
                        onSubmit={() => console.log("On preset change")}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Stack gap={4} direction="row">
                                <Typography className="grow" fontWeight="md" level="title-md">
                                    {title}
                                </Typography>
                                <Switch className="toggle justify-end" defaultChecked={!!preset} onChange={({ target }) => this.onToggle(target.checked)} />
                            </Stack>
                            <Typography level="body-md">{description}</Typography>
                        </Box>
                    </LabsForm>
                </CardContent>
            </Card>
        );
    }
}