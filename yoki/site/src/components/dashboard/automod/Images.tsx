import { faImage } from "@fortawesome/free-solid-svg-icons";
import { Box, Card, CardContent, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { PremiumType } from "@prisma/client";
import LabsForm, { LabsFormFieldValueMap } from "../../form/LabsForm";
import { LabsFormFieldType, LabsFormSectionOrder } from "../../form/form";
import { errorifyResponseError, notifyFetchError } from "../../../utils/errorUtil";

export default class ImagesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    get isEnabled() {
        const { premium } = this.props.serverConfig;

        return premium === PremiumType.Silver || premium === PremiumType.Gold;
    }

    async onSettingsModified(values: LabsFormFieldValueMap) {
        const { serverId } = this.props.serverConfig;
        const { nsfwPornConfidence, nsfwHentaiConfidence } = values;

        return fetch(`/api/servers/${serverId}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ nsfwPornConfidence, nsfwHentaiConfidence }),
        })
            .then(errorifyResponseError)
            .catch(notifyFetchError.bind(null, "Error while updating server data for image filter settings"));
    }

    render() {
        const { serverConfig } = this.props;
        const { isEnabled } = this;

        return (
            <>
                <Box className="grid gap-4">
                    <DashboardModule
                        name="NSFW Image Scan"
                        description="Removes any potentially NSFW images from chat and media."
                        icon={faImage}
                        activeClassName="from-pink-500 to-purple-500"
                        serverConfig={serverConfig}
                        prop="scanNSFW"
                        requiresPremium={PremiumType.Silver}
                        disabled={!serverConfig.premium}
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Box>
                    <Typography level="title-lg" gutterBottom>
                        Explicit image detection confidence
                    </Typography>
                    <Card>
                        <CardContent>
                            <LabsForm
                                id="images-page-form"
                                sections={[
                                    {
                                        order: LabsFormSectionOrder.Grid,
                                        gap: 4,
                                        fields: [
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "nsfwHentaiConfidence",
                                                name: "Hentai confidence",
                                                description: "The confidence NSFW image filter's detection should have on image being hentai before filtering the image.",
                                                defaultValue: serverConfig.nsfwHentaiConfidence ?? 0.5,
                                                min: 0,
                                                max: 1,
                                                allowFloating: true,
                                                step: 0.1,
                                                disabled: !isEnabled,
                                            },
                                            {
                                                type: LabsFormFieldType.Number,
                                                prop: "nsfwPornConfidence",
                                                name: "Porn confidence",
                                                description: "The confidence NSFW image filter's detection should have on image being porn before filtering the image.",
                                                defaultValue: serverConfig.nsfwPornConfidence ?? 0.65,
                                                min: 0,
                                                max: 1,
                                                allowFloating: true,
                                                step: 0.1,
                                                disabled: !isEnabled,
                                            },
                                        ],
                                    },
                                ]}
                                onSubmit={(formState) => this.onSettingsModified(formState)}
                            />
                        </CardContent>
                    </Card>
                </Box>
            </>
        );
    }
}
