import { Box, Stack, Typography } from "@mui/joy";
import { formatDate } from "@yokilabs/utils";
import { LabsUserCard } from "../../LabsUserCard";
import InfoText from "../../InfoText";
import { faClock, faDroplet } from "@fortawesome/free-solid-svg-icons";
import { ItemProps } from "../../DataTable";
import { SanitizedUrlFilter } from "../../../lib/@types/db";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { severityToIcon, severityToName } from "../../../utils/actionUtil";
import DataTableRow from "../../DataTableRow";
import DataTableCard from "../../DataTableCard";
import CodeWrapper from "../../CodeWrapper";

export function UrlRow({ item: link, users, columnCount, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedUrlFilter>) {
    return (
        <DataTableRow
            id={`url-row-${link.id}`}
            columnCount={columnCount}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            ExpandedInfoRenderer={() => (
                <Stack gap={3}>
                    <InfoText icon={faDroplet} name="Infraction points">
                        {link.infractionPoints}
                    </InfoText>
                </Stack>
            )}
        >
            <td>
                <UrlContentDisplay subdomain={link.subdomain} domain={link.domain} route={link.route} />
            </td>
            <td>
                <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[link.severity]} />} fontWeight="lg" textColor="text.secondary">
                    {severityToName[link.severity]}
                </Typography>
            </td>
            <td>
                <LabsUserCard userId={link.creatorId} user={users?.[link.creatorId]} />
            </td>
            <td>
                <Typography level="body-md">{formatDate(new Date(link.createdAt), timezone)}</Typography>
            </td>
        </DataTableRow>
    );
}

export function UrlCard({ item: link, users, timezone, disableSelection, isSelected, onSelected }: ItemProps<SanitizedUrlFilter>) {
    return (
        <DataTableCard
            id={`url-card-${link.id}`}
            disableSelection={disableSelection}
            isSelected={isSelected}
            onSelected={onSelected}
            TitleRenderer={() => (
                <>
                    <Typography level="body-md" textColor="text.secondary">
                        {link.domain}
                    </Typography>
                    <Typography level="body-lg" textColor="text.tertiary">
                        {"\u2022"}
                    </Typography>
                    <Typography startDecorator={<FontAwesomeIcon icon={severityToIcon[link.severity]} />} fontWeight="lg" textColor="text.secondary">
                        {link.severity}
                    </Typography>
                </>
            )}
            ExpandedInfoRenderer={() => (
                <Stack gap={3}>
                    <Box>
                        <Typography level="h2" fontSize="md" gutterBottom>
                            Full URL
                        </Typography>
                        <CodeWrapper>
                            <Typography textColor="text.secondary">
                                {link.subdomain}
                                {link.domain}
                                {link.route}
                            </Typography>
                        </CodeWrapper>
                    </Box>
                    <Box>
                        <Typography level="h2" fontSize="md" gutterBottom>
                            Creator
                        </Typography>
                        <LabsUserCard userId={link.creatorId} user={users?.[link.creatorId]} />
                    </Box>
                    <Box>
                        <InfoText icon={faDroplet} name="Infraction points">
                            {link.infractionPoints}
                        </InfoText>
                        <InfoText icon={faClock} name="Created">
                            {formatDate(new Date(link.createdAt), timezone)}
                        </InfoText>
                    </Box>
                </Stack>
            )}
        ></DataTableCard>
    );
}

export function UrlContentDisplay({ subdomain, domain, route }: { subdomain: string | null; domain: string; route: string | null }) {
    return (
        <Typography level="code" sx={(theme) => ({ backgroundColor: theme.vars.palette.background.level1, width: "max-content" })}>
            {subdomain}
            {domain}
            {route}
        </Typography>
    );
}
