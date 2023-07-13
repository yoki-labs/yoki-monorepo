import LabsForm, { LabsFormFieldType } from "../../LabsForm";

export default function Config() {
    return (
        <LabsForm
            sections={[
                {
                    fields: [
                        {
                            prop: "prefix",
                            name: "Prefix",
                            type: LabsFormFieldType.Text,
                            description: "Change the prefix Yoki uses to recognize commands for your server.",
                        },
                        {
                            prop: "language",
                            name: "Language",
                            description: "Change the language Yoki uses to respond to respond in (WIP)",
                            type: LabsFormFieldType.Select,
                            value: "en_US",
                            values: [
                                {
                                    name: "English (US)",
                                    value: "en_US",
                                },
                            ],
                        },
                        {
                            prop: "timezone",
                            name: "Timezone",
                            type: LabsFormFieldType.Text,
                            description: "Change the timezone Yoki uses to display times in",
                        },
                    ],
                },
            ]}
            onSubmit={({ values }) => console.log("New config values", values)}
        />
    );
}
