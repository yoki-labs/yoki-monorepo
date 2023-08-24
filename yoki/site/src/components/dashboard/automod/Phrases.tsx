import { Box, Stack, Typography } from "@mui/joy";
import React from "react";
import DashboardModule from "../DashboardModule";
import { DashboardPageProps } from "../pages";
import { faBan, faDroplet } from "@fortawesome/free-solid-svg-icons";
import DataTable, { ItemProps } from "../../DataTable";
import { SanitizedContentFilter } from "../../../lib/@types/db";
import DataTableRow from "../../DataTableRow";
import InfoText from "../../InfoText";
import { LabsUserCard } from "../../LabsUserCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { severityToIcon } from "../../../utils/actionUtil";
import { formatDate } from "@yokilabs/utils";
import { FilterMatching } from "@prisma/client";

export default class PhrasesPage extends React.Component<DashboardPageProps> {
    constructor(props: DashboardPageProps) {
        super(props);
    }

    getPhrasesRoute(page: number, search?: string) {
        const { serverConfig: { serverId } } = this.props;

        return `/api/servers/${serverId}/phrases?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    }

    async fetchPhrases(page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "GET",
            headers: { "content-type": "application/json" },
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ phrases, count }) => ({ items: phrases, maxPages: Math.ceil(count / 50) }));
    } 

    async deletePhrases(phraseIds: number[], page: number, search?: string) {
        return fetch(this.getPhrasesRoute(page, search), {
            method: "DELETE",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ phraseIds }),
        })
            .then((response) => {
                if (!response.ok)
                    throw response;
                return response.json();
            })
            .then(({ phrases, count }) => ({ items: phrases, maxPages: Math.ceil(count / 50) }));
    } 

    render() {
        const { serverConfig } = this.props;

        return (
            <>
                <Box className="grid">
                    <DashboardModule
                        name="Phrase Filter"
                        description="Filters blacklisted phrases, as well as spam and links."
                        icon={faBan}
                        activeClassName="from-red-500 to-pink-500"
                        isActive={serverConfig.filterEnabled}
                        onToggle={(value) => console.log("Automod toggle NSFW Image scan", value)}
                        iconAspectRatio={1}
                        hideBadges
                        largeHeader
                    />
                </Box>
                <Stack direction="column" gap={3}>
                    <Typography level="h4">Banned phrases</Typography>
                    <DataTable<SanitizedContentFilter, number>
                        itemType="banned phrases"
                        timezone={serverConfig.timezone}
                        columns={["Content", "Severity", "Created by", "Created at"]}
                        getItems={this.fetchPhrases.bind(this)}
                        deleteItems={this.deletePhrases.bind(this)}
                        ItemRenderer={PhraseRow}
                        />
                </Stack>
            </>
        );
    }
}

function PhraseRow({ item: phrase, columnCount, timezone, isSelected, onSelected }: ItemProps<SanitizedContentFilter>) {
    return (
        <DataTableRow
            id={`phrase-${phrase.id}`}
            columnCount={columnCount}
            isSelected={isSelected}
            onSelected={onSelected}
            expandedInfo={() =>
                <Stack gap={3}>
                    <InfoText icon={faDroplet} name="Infraction points">{phrase.infractionPoints}</InfoText>
                </Stack>
            }
        >
            <td>
                <PhraseContentDisplay
                    content={phrase.content}
                    matching={phrase.matching}
                    />
            </td>
            <td>
                <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[phrase.severity]} />} fontWeight="lg" textColor="text.secondary">
                    {phrase.severity}
                </Typography>
            </td>
            <td>
                <LabsUserCard userId={phrase.creatorId} />
            </td>
            <td>
                <Typography level="body2">{formatDate(new Date(phrase.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}
const prefixed: FilterMatching[] = [FilterMatching.PREFIX, FilterMatching.INFIX];
const suffixed: FilterMatching[] = [FilterMatching.POSTFIX, FilterMatching.INFIX];

function PhraseContentDisplay({ content, matching }: { content: string; matching: FilterMatching }) {
    return (
        <Stack direction="row" gap={0.5} alignItems="center">
            {prefixed.includes(matching) && <Typography level="body1" textColor="text.tertiary" fontSize="lg" fontWeight="bolder" sx={{ userSelect: "none" }}>
                {"*"}
            </Typography> }
            <Typography level="body2" textColor="text.secondary">
                {content.length > 32 ? `${content.slice(0, 32)}...` : content}
            </Typography>
            {suffixed.includes(matching) && <Typography level="body1" textColor="text.tertiary" fontSize="lg" fontWeight="bolder" sx={{ userSelect: "none" }}>
                {"*"}
            </Typography> }
        </Stack>
    )
}