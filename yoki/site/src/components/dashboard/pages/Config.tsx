import { FormControl } from "@mui/base";
import LabsForm, { LabsFormFieldType } from "../../LabsForm";

const questions = {
    prefix: {
        label: "Prefix",
        description: "Change the prefix Yoki uses to recognize commands for your server.",
        type: "text",
    },
    language: {
        label: "Language",
        description: "Change the language Yoki uses to respond to respond in (WIP)",
        type: "text",
    },
    timezone: {
        label: "Timezone",
        description: "Change the timezone Yoki uses to display times in",
        type: "text",
    },
    memberRole: {
        label: "Member Role",
        description: "Change the role Yoki uses to recognize regular members",
        type: "text",
    },
    muteRole: {
        label: "Mute Role",
        description: "Change the role Yoki uses to mute bad actors",
        type: "text",
    },
};

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
                                {
                                    name: "Lithuanian",
                                    value: "lt_LT",
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
