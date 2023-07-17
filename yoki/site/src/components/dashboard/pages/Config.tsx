import { timezones } from "@yokilabs/utils";
import LabsForm from "../../LabsForm";
import { DashboardPageProps } from "./page";
import { LabsFormFieldType } from "../../form";

export default function ConfigPage(props: DashboardPageProps) {
    return (
        <LabsForm
            sections={[
                {
                    fields: [
                        {
                            prop: "prefix",
                            name: "Prefix",
                            defaultValue: props.serverConfig.prefix ?? "?",
                            type: LabsFormFieldType.Text,
                            description: "Change the prefix Yoki uses to recognize commands for your server.",
                        },
                        {
                            prop: "language",
                            name: "Language",
                            description: "Change the language Yoki uses to respond to respond in (WIP)",
                            type: LabsFormFieldType.Select,
                            defaultValue: props.serverConfig.locale,
                            disabled: true,
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
                            defaultValue: props.serverConfig.timezone,
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
