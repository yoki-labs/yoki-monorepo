import { faClock, faDroplet } from "@fortawesome/free-solid-svg-icons";
import { SanitizedContentFilter } from "../../../lib/@types/db";
import { ItemProps } from "../../DataTable";
import DataTableRow from "../../DataTableRow";
import { Box, Stack, Typography } from "@mui/joy";
import InfoText from "../../InfoText";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LabsUserCard } from "../../LabsUserCard";
import { severityToIcon, severityToName } from "../../../utils/actionUtil";
import { formatDate } from "@yokilabs/utils";
import { FilterMatching } from "@prisma/client";
import DataTableCard from "../../DataTableCard";

export function PhraseRow({ item: phrase, users, columnCount, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedContentFilter>) {
    return (
        <DataTableRow
            id={`phrase-row-${phrase.id}`}
            columnCount={columnCount}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => (
                <Stack gap={3}>
                    <InfoText icon={faDroplet} name="Infraction points">
                        {phrase.infractionPoints}
                    </InfoText>
                </Stack>
            )}
        >
            <td>
                <PhraseContentDisplay content={phrase.content} matching={phrase.matching} />
            </td>
            <td>
                <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[phrase.severity]} />} fontWeight="lg" textColor="text.secondary">
                    {severityToName[phrase.severity]}
                </Typography>
            </td>
            <td>
                <LabsUserCard userId={phrase.creatorId} user={users?.[phrase.creatorId]} />
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(phrase.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

export function PhraseCard({ item: phrase, users, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedContentFilter>) {
    return (
        <DataTableCard
            id={`phrase-card-${phrase.id}`}
            TitleRenderer={() => (
                <>
                    <PhraseContentDisplay content={phrase.content} matching={phrase.matching} />
                    <Typography level="body-lg" textColor="text.tertiary">
                        {"\u2022"}
                    </Typography>
                    <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[phrase.severity]} />} fontWeight="lg" textColor="text.secondary">
                        {phrase.severity}
                    </Typography>
                </>
            )}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => (
                <Stack gap={3}>
                    <Box>
                        <Typography level="h2" fontSize="md" gutterBottom>
                            Creator
                        </Typography>
                        <LabsUserCard userId={phrase.creatorId} user={users?.[phrase.creatorId]} />
                    </Box>
                    <Box>
                        <InfoText icon={faDroplet} name="Infraction points">
                            {phrase.infractionPoints}
                        </InfoText>
                        <InfoText icon={faClock} name="Created">
                            {formatDate(new Date(phrase.createdAt), timezone)}
                        </InfoText>
                    </Box>
                </Stack>
            )}
        ></DataTableCard>
    );
}

const prefixed: FilterMatching[] = [FilterMatching.PREFIX, FilterMatching.INFIX];
const suffixed: FilterMatching[] = [FilterMatching.POSTFIX, FilterMatching.INFIX];

function PhraseContentDisplay({ content, matching }: { content: string; matching: FilterMatching }) {
    return (
        <Typography level="code" sx={(theme) => ({ backgroundColor: theme.vars.palette.background.level1, width: "max-content" })}>
            <Stack direction="row" gap={0.5} alignItems="center">
                {prefixed.includes(matching) && (
                    <Typography level="body-md" fontSize="lg" fontWeight="bolder" sx={{ opacity: 0.6, color: "inherit", fontFamily: "inherit", userSelect: "none" }}>
                        {"*"}
                    </Typography>
                )}
                <Typography level="body-md" sx={{ color: "inherit", fontFamily: "inherit" }}>
                    {content.length > 32 ? `${content.slice(0, 32)}...` : content}
                </Typography>
                {suffixed.includes(matching) && (
                    <Typography level="body-md" fontSize="lg" fontWeight="bolder" sx={{ opacity: 0.6, color: "inherit", fontFamily: "inherit", userSelect: "none" }}>
                        {"*"}
                    </Typography>
                )}
            </Stack>
        </Typography>
    );
}
