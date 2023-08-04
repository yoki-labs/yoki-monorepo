import { Box, Card, CardContent, Stack, Typography } from "@mui/joy";
import LabsSwitch from "../../LabsSwitch";
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

export default class AutomodPreset extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    onToggle(value: boolean) {
        console.log("Preset value changed", [value]);
    }

    render() {
        const { title, description, preset } = this.props;

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
                                    },
                                    {
                                        type: LabsFormFieldType.Number,
                                        name: "Infraction Points",
                                        prop: "infractions",
                                        placeholder: "A whole number",
                                        defaultValue: preset?.infractionPoints ?? 5,
                                    }
                                ]
                            }
                        ]}
                        onSubmit={() => console.log("On preset change")}
                    >
                        <Box sx={{ mb: 2 }}>
                            <Stack gap={4} direction="row">
                                <Typography className="grow" fontWeight="md" level="body1">
                                    {title}
                                </Typography>
                                <LabsSwitch className="toggle justify-end" defaultChecked={!!preset} onChange={({ target }) => this.onToggle(target.checked)} />
                            </Stack>
                            <Typography level="body2">{description}</Typography>
                        </Box>
                    </LabsForm>
                </CardContent>
            </Card>
        );
    }
}