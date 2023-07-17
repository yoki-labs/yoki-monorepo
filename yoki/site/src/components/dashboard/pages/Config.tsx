import { timezones } from "@yokilabs/utils";
import LabsForm from "../../LabsForm";
import { DashboardPageProps } from "./page";
import { LabsFormFieldType } from "../../form";
import React from "react";

export default class ConfigPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <LabsForm
                sections={[
                    {
                        fields: [
                            {
                                prop: "prefix",
                                name: "Prefix",
                                defaultValue: serverConfig.prefix,
                                placeholder: "?",
                                type: LabsFormFieldType.Text,
                                description: "Change the prefix Yoki uses to recognize commands for your server.",
                            },
                            {
                                prop: "language",
                                name: "Language",
                                description: "Change the language Yoki uses to respond to respond in (WIP)",
                                type: LabsFormFieldType.Select,
                                defaultValue: serverConfig.locale,
                                disabled: true,
                                badge: { text: "WIP", color: "primary" },
                                selectableValues: [
                                    {
                                        name: "English (US)",
                                        value: "en-US",
                                    },
                                ],
                            },
                            {
                                prop: "timezone",
                                name: "Timezone",
                                type: LabsFormFieldType.Select,
                                defaultValue: serverConfig.timezone,
                                selectableValues: timezones.map((timezone) => ({ name: timezone, value: timezone })),
                                description: "Change the timezone Yoki uses to display times in",
                            },
                        ],
                    },
                ]}
                onSubmit={({ values }) => console.log("New config values", values)}
            />
        );
    }
}
