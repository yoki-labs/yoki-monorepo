import { faAnglesDown, faBan } from "@fortawesome/free-solid-svg-icons";
import { Box, Card, CardContent, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";

export default class SpamPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    async onSettingsModified(values: LabsFormFieldValueMap) {
        const { serverId } = this.props.serverConfig;
        const { spamFrequency, spamMentionFrequency, spamInfractionPoints } = values;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ spamFrequency, spamMentionFrequency, spamInfractionPoints }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating server data for spam settings"));
    }

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <DashboardModule
                        name="Filter Spam"
                        description="Filters out spam, as well as blacklisted phrases or links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        serverConfig={serverConfig}
                        prop="filterEnabled"
                        hideBadges
                        largeHeader
                    />
                    <DashboardModule
                        name="Anti-hoist"
                        description="Prevents people from purposefully putting themselves from above everyone."
                        icon={faAnglesDown}
                        activeClassName="from-orange-500 to-yellow-500"
                        serverConfig={serverConfig}
                        prop="antiHoistEnabled"
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="title-lg" gutterBottom>
                        Spam detection
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                id="spam-page-form"
                                sections={[
                                    {
                                        order: LabsFormSectionOrder.Grid,
                                        gap: 4,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "spamFrequency",
                                                name: "Spam message frequency",
                                                description: "The number of messages that is needed to be posted within 5 seconds to consider it as spam.",
                                                defaultValue: serverConfig.spamFrequency,
                                                min: 2,
                                                max: 100,
                                            },
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "spamMentionFrequency",
                                                name: "Spam mention frequency",
                                                description: "The number of mentions that is needed to be posted within 5 seconds to consider it as spam.",
                                                defaultValue: serverConfig.spamMentionFrequency,
                                                min: 2,
                                                max: 100,
                                            },
                                        ],
                                    },
                                    {
                                        name: "Spam punishment",
                                        order: LabsFormSectionOrder.Grid,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "spamInfractionPoints",
                                                name: "Spam infraction points",
                                                description: "The amount of infraction points to give when someone starts spamming.",
                                                defaultValue: serverConfig.spamInfractionPoints,
                                                min: 1,
                                                max: 100,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={(formState) => this.onSettingsModified(formState)}
                            />
                        </CardContent>
                    </Card>
                </Box>
                {/* <PagePlaceholder icon={PagePlaceholderIcon.Wip} title="Work in progress" description="This section has not been done yet. Come back later!" /> */}
            </>
        );
    }
}
