import { Accordion, AccordionDetails, AccordionGroup, AccordionSummary, Box, Card, Chip, Grid, List, ListItem, ListItemDecorator, Stack, Typography, styled } from "@mui/joy";
import { Command } from "../../../lib/Command";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { CommandArgType } from "@yokilabs/utils";
import CodeWrapper from "../../CodeWrapper";

type Props = {
    command: Command;
    isSubCommand?: boolean;
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

const SubCommandCard = styled(Card)(({ theme }) => ({
    position: "relative",
    "::after": {
        content: "''",
        top: "50%",
        left: -32,
        width: 32,
        // borderLeft: `solid 3px ${theme.vars.palette.background.level2}`,
        borderBottom: `solid 3px ${theme.vars.palette.background.level2}`,
        // borderBottomLeftRadius: theme.vars.radius.sm,
        position: "absolute",
        zIndex: "-1",
        "--tw-content": "''",
    },
}));
const Line = styled(`div`, {
    name: `CommandDisplayLine`,
})(({ theme }) => ({
    width: 3,
    height: "100%",
    backgroundColor: theme.vars.palette.background.level2,
}));

export default function CommandDisplay({ command, isSubCommand }: Props) {
    const requiredRoleBadge = command.requiredRole && (
        <Chip color="primary" startDecorator={<FontAwesomeIcon icon={faShieldHalved} />}>
            {command.requiredRole}
        </Chip>
    );
    const normalizedName = command.name.split("-").join(" ");

    const CommandCard = isSubCommand ? SubCommandCard : Card;
    return (
        <Box>
            <CommandCard sx={{ zIndex: "4" }} className="after:w-3 after:-left-3 md:after:w-8 md:after:-left-8">
                <Stack direction="row" gap={2} alignItems="center">
                    <Typography level="code" fontWeight="bolder">
                        ?{normalizedName}
                    </Typography>
                    {requiredRoleBadge}
                </Stack>
                <Typography level="body-md">{command.description}</Typography>
                {command.args?.length ? <CommandDisplayArguments args={command.args} /> : null}
                {command.examples?.length ? <CommandDisplayExamples name={normalizedName} examples={command.examples} /> : null}
            </CommandCard>
            {command.subCommands && <CommandDisplaySubCommands commands={command.subCommands} />}
        </Box>
    );
}

function CommandDisplayArguments({ args }: { args: Command["args"] }) {
    return (
        <Box>
            <Typography level="title-sm">Arguments</Typography>
            <List>
                {args!.map((x) => (
                    <ListItem sx={{ "margin-inline": 0, "--ListItemDecorator-size": "1.2rem" }}>
                        <ListItemDecorator>
                            <Typography fontWeight="bolder" textColor="text.tertiary" fontSize="lg">
                                {"\u2022"}
                            </Typography>
                        </ListItemDecorator>
                        <Box sx={{ flexGrow: 1 }} className="grid grid-cols-1 md:grid-cols-2">
                            <Box>
                                <Typography component="span" level="body-md">
                                    {(x.type === "rest" || x.type === "enumList") && "..."}
                                    {x.display ?? x.name}
                                </Typography>
                            </Box>
                            <Box>
                                <Stack direction="row" gap={1}>
                                    <Typography component="span" level="body-md" textColor="text.secondary" fontWeight="bold">
                                        {argumentTypeToDisplay[x.type]}
                                    </Typography>
                                    {x.optional && (
                                        <Chip size="sm" color="neutral">
                                            Optional
                                        </Chip>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

function CommandDisplayExamples({ name, examples }: { name: string; examples: string[] }) {
    return (
        <Box>
            <Typography level="title-sm" gutterBottom>
                Examples
            </Typography>
            <CodeWrapper>
                <Stack direction="column" gap={1}>
                    {examples.map((x) => (
                        <Typography level="code" textColor="text.secondary">
                            ?{name} {x}
                        </Typography>
                    ))}
                </Stack>
            </CodeWrapper>
        </Box>
    );
}

function CommandDisplaySubCommands({ commands }: { commands: Command[] }) {
    return (
        <AccordionGroup size="lg">
            <Accordion>
                <AccordionSummary>Sub-commands</AccordionSummary>
                <AccordionDetails>
                    <Stack direction="row" alignItems="stretch" className="gap-3 md:gap-8">
                        <Line />
                        <Stack sx={{ pt: 2, flex: "1" }} gap={2} alignItems="stretch">
                            {commands.map((subCommand) => (
                                <CommandDisplay command={subCommand} isSubCommand />
                            ))}
                        </Stack>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </AccordionGroup>
    );
}
