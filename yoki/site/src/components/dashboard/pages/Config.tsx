import { timezones } from "@yokilabs/utils";
import LabsForm, { LabsFormFieldType } from "../../LabsForm";
import { DashboardPageProps } from "./page";

export default function Config(props: DashboardPageProps) {
    console.log("Prefix", [props.serverConfig.prefix, "?"]);
    return (
        <LabsForm
            sections={[
                {
                    fields: [
                        {
                            prop: "prefix",
                            name: "Prefix",
                            value: props.serverConfig.prefix ?? "?",
                            type: LabsFormFieldType.Text,
                            description: "Change the prefix Yoki uses to recognize commands for your server.",
                        },
                        {
                            prop: "language",
                            name: "Language",
                            description: "Change the language Yoki uses to respond to respond in (WIP)",
                            type: LabsFormFieldType.Select,
                            value: props.serverConfig.locale,
                            values: [
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
                            value: props.serverConfig.timezone,
                            values: timezones.map((timezone) => ({ name: timezone, value: timezone })),
                            description: "Change the timezone Yoki uses to display times in",
                        },
                    ],
                },
            ]}
            onSubmit={({ values }) => console.log("New config values", values)}
        />
    );
}
