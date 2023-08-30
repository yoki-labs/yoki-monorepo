import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Box, Card, Chip, Grid, List, ListItem, Stack, Typography, styled } from "@mui/joy";
import { Command } from "../../../lib/Command";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { CommandArgType } from "@yokilabs/utils";

type Props = {
    command: Command;
};

const argumentTypeToDisplay: Record<CommandArgType, string> = {
    string: "text",
    rest: "text",
    number: "number",
    boolean: "'yes' or 'no'",
    UUID: "ID",
    member: "server member",
    enum: "allowed values",
    enumList: "allowed values",
    time: "time",
    channel: "server channel",
    emote: "emote",
    role: "server role",
};

export default function CommandDisplay({ command }: Props) {
    const requiredRoleBadge = command.requiredRole && <Chip color="primary" startDecorator={<FontAwesomeIcon icon={faShieldHalved} />}>{ command.requiredRole }</Chip>;
    const normalizedName = command.name.split("-").join(" ");

    return (
        <Box>
            <Card sx={{ zIndex: "4" }}>
                <Typography level="title-md" sx={{ "--Typography-gap": "16px", }} endDecorator={requiredRoleBadge}>
                    {`${normalizedName[0].toUpperCase()}${normalizedName.substring(1)}`}
                </Typography>
                <Typography level="body-md">
                    {command.description}
                </Typography>
                { command.args && <CommandDisplayArguments args={command.args} /> }
            </Card>
            { command.subCommands && <CommandDisplaySubCommands commands={command.subCommands} /> }
        </Box>
    );
}

function CommandDisplayArguments({ args }: { args: Command["args"] }) {
    return (
        <Box>
            <Typography level="title-sm">Arguments</Typography>
            <List>
                {args!.map((x) =>
                    <ListItem>
                        <Grid container spacing={1} sx={{ flexGrow: 1 }}>
                            <Grid xs={4}>
                                <Typography component="span" level="body-md">
                                    { (x.type === "rest" || x.type === "enumList") && "..." }
                                    { x.display ?? x.name }
                                </Typography>
                            </Grid>
                            <Grid xs={6}>
                                <Stack direction="row" gap={1}>
                                    <Typography component="span" level="body-md" textColor="text.secondary" fontWeight="bold">
                                        { argumentTypeToDisplay[x.type] }
                                    </Typography>
                                    { x.optional && <Chip size="sm" color="neutral">Optional</Chip> }
                                </Stack>
                            </Grid>
                        </Grid>
                    </ListItem>
                )}
            </List>
        </Box>
    )
}

const SubCommandWrapper = styled(Box)(({ theme }) => ({
    position: "relative",
    "::after": {
        content: "''",
        top: "-150%",
        left: -20,
        width: 40,
        height: "200%",
        borderLeft: `solid 3px ${theme.vars.palette.background.level2}`,
        borderBottom: `solid 3px ${theme.vars.palette.background.level2}`,
        borderBottomLeftRadius: theme.vars.radius.sm,
        position: "absolute",
    }
}));

function CommandDisplaySubCommands({ commands }: { commands: Command[]; }) {
    return (
        <AccordionGroup size="lg">
            <Accordion>
                <AccordionSummary>Sub-commands</AccordionSummary>
                <AccordionDetails>
                    <Stack sx={{ pt: 2, pl: 4 }} gap={2}>
                        {commands.map((subCommand) =>
                            <SubCommandWrapper>
                                <CommandDisplay command={subCommand} />
                            </SubCommandWrapper>
                        )}
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </AccordionGroup>
    );
}