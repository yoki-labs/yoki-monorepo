import {
    Accordion,
    AccordionDetails,
    AccordionGroup,
    AccordionSummary,
    Box,
    Card,
    Chip,
    Grid,
    List,
    ListItem,
    ListItemDecorator,
    Stack,
    Tooltip,
    Typography,
    styled,
} from "@mui/joy";
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
    user: "user",
    enum: "allowed values",
    enumList: "allowed values",
    time: "time",
    channel: "server channel",
    emote: "emote",
    role: "server role",
};

const SubCommandCard = styled(Card, {
    name: "SubCommandCard",
})(({ theme }) => ({
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
        <Tooltip title={<>This command requires having a role that is set at <Chip variant="soft" color="primary" size="sm">{command.requiredRole[0]}{command.requiredRole.substring(1).toLowerCase()}</Chip> level or higher</>}>
            <Chip variant="soft" color="primary" startDecorator={<FontAwesomeIcon icon={faShieldHalved} />}>
                {command.requiredRole[0]}
                {command.requiredRole.substring(1).toLowerCase()}
            </Chip>
        </Tooltip>
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
                {command.args?.length ? <CommandDisplayArguments command={command} /> : null}
                {command.examples?.length ? <CommandDisplayExamples name={normalizedName} command={command} /> : null}
            </CommandCard>
            {command.subCommands && <CommandDisplaySubCommands command={command} />}
        </Box>
    );
}

function CommandDisplayArguments({ command }: { command: Command }) {
    return (
        <Box>
            <Typography level="title-sm">Arguments</Typography>
            <List>
                {command.args!.map((x, i) => (
                    <ListItem key={`command.${command.name}.args.${i}`} sx={{ marginInline: 0, "--ListItemDecorator-size": "1.2rem" }}>
                        <ListItemDecorator>
                            <Typography fontWeight="bolder" textColor="text.tertiary" fontSize="lg">
                                {"\u2022"}
                            </Typography>
                        </ListItemDecorator>
                        <Box sx={{ flexGrow: 1 }} className="grid grid-cols-1 md:grid-cols-[1fr,3fr]">
                            <Box>
                                <Typography component="span" level="body-md">
                                    {(x.type === "rest" || x.type === "enumList") && "..."}
                                    {x.display ?? x.name}
                                </Typography>
                            </Box>
                            <Box>
                                <Stack direction="row" gap={1}>
                                    {x.values
                                    ? (
                                        <Tooltip title={<CommandArgumentValues commandName={command.name} argumentIndex={i} values={x.values} />}>
                                            <Typography component="span" level="body-md">
                                                {argumentTypeToDisplay[x.type]}
                                            </Typography>
                                        </Tooltip>
                                    )
                                    : (
                                        <Typography component="span" level="body-md">
                                            {argumentTypeToDisplay[x.type]}
                                        </Typography>
                                    )}
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

function CommandArgumentValues({ commandName, argumentIndex, values }: { commandName: string; argumentIndex: number; values: string[]; }) {
    return (
        <>
            <Typography level="title-md" gutterBottom>Argument allows the following:</Typography>
            <List>
                {values
                    .map((x, i) =>
                        <ListItem key={`command.${commandName}.args.${argumentIndex}.tooltip-value.${i}`}>
                            <Typography level="code" sx={{ width: "max-content" }}>
                                {x.toLowerCase()}
                            </Typography>
                        </ListItem>
                    )
                }
            </List>
        </>
    );
}

function CommandDisplayExamples({ name, command }: { name: string; command: Command }) {
    return (
        <Box>
            <Typography level="title-sm" gutterBottom>
                Examples
            </Typography>
            <CodeWrapper>
                <Stack direction="column" gap={1}>
                    {command.examples!.map((x, i) => (
                        <Typography key={`commands.${command.name}.example.${i}`} level="code" textColor="text.secondary">
                            ?{name} {x}
                        </Typography>
                    ))}
                </Stack>
            </CodeWrapper>
        </Box>
    );
}

function CommandDisplaySubCommands({ command }: { command: Command }) {
    return (
        <AccordionGroup size="lg">
            <Accordion key={`commands.${command.name}.subcommands`}>
                <AccordionSummary>
                    <Typography level="title-md" fontWeight="bolder" textColor="text.tertiary">
                        Sub-commands
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="row" alignItems="stretch" className="gap-3 md:gap-8">
                        <Line />
                        <Stack sx={{ pt: 2, flex: "1" }} gap={2} alignItems="stretch">
                            {command.subCommands!.map((subCommand) => (
                                <CommandDisplay key={`commands.${command.name}.subcommands.${subCommand.name}`} command={subCommand} isSubCommand />
                            ))}
                        </Stack>
                    </Stack>
                </AccordionDetails>
            </Accordion>
        </AccordionGroup>
    );
}
