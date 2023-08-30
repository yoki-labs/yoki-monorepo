import type { GetServerSideProps, GetServerSidePropsResult, NextPage } from "next";
import { LandingPage } from "../../components/landing/LandingPage";
import { Command } from "../../lib/Command";
import commands from "../../../commands.json";
import { Box, Stack, Typography } from "@mui/joy";
import CommandSidebar from "../../components/landing/commands/CommandSidebar";
import CommandDisplay from "../../components/landing/commands/CommandDisplay";

interface GroupedCommands {
    [x: string]: Command[];
}

type CommandProps = {
    commandByCategory: GroupedCommands;
    commandCategories: Record<string, string>;
    category: string;
};

const commandByCategory = commands.reduce<GroupedCommands>((group, command) => {
    const category = command.category ?? "General";

    group[category] = group[category] ?? [];
    group[category].push(command as Command);

    return group;
}, {});
// const commandCategories = Object.keys(commandByCategory);
const commandCategories = Object
    .keys(commandByCategory)
    .reduce<Record<string, string>>((categories, category) =>
        (categories[category.split(" ").join("").toLowerCase()] = category, categories),
        {}
    );
const categoryKeys = Object.keys(commandCategories);

export const getServerSideProps: GetServerSideProps = async (ctx): Promise<GetServerSidePropsResult<CommandProps>> => {
    const category = ctx.query.category as string;

    // Doesn't exist
    if (!categoryKeys.includes(category))
        return { redirect: { destination: "/commands/general", permanent: false } };

    return {
        props: {
            commandByCategory,
            commandCategories,
            category,
        },
    };
};

const Commands: NextPage<CommandProps> = ({ commandByCategory, commandCategories, category }) => {
    const commands = commandByCategory[commandCategories[category]];

    return (
        <LandingPage>
            <Stack sx={{ py: 6, px: 20 }} direction="row">
                <CommandSidebar categories={commandCategories} activeCategory={category} />
                <Box sx={{ px: 8, flex: "1" }}>
                    <Typography level="h2" sx={{ mb: 4 }}>{commandCategories[category]}</Typography>
                    <Stack gap={4} direction="column" alignItems="stretch">
                        {commands.map((x) =>
                            <CommandDisplay command={x} />
                        )}
                    </Stack>
                </Box>
            </Stack>
            {/* <div className="flex flex-col lg:flex-row justify-center md:px-20 mx-auto scroll-smooth">
                <div className="mt-8 px-6 md:mt-0 md:mx-0">
                    <CommandNavigation className="pt-4">
                        <h1 className="text-3xl pb-4">Categories</h1>
                        <CommandTop
                            href="#"
                            className="px-2 flex justify-center items-center gap-2"
                            onClick={() => {
                                setActiveItem("");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                        >
                            <UpArrow></UpArrow>
                            Top
                        </CommandTop>
                        {categories.map((c) => (
                            <a key={c} className={c === activeItem ? "active" : ""} onClick={() => setActiveItem(c)} href={`#${c}`}>
                                {c.charAt(0).toUpperCase() + c.slice(1)}
                            </a>
                        ))}
                    </CommandNavigation>
                </div>
                <div className="pt-8 flex flex-col gap-10 space-y-5 px-6 lg:px-14">
                    {categories.map((category) => (
                        <div className="space-y-5" key={category}>
                            <Category className="text-3xl text-white pb-2" id={category}>
                                <a href={`#${category}`} onClick={() => setActiveItem(category)}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </a>
                            </Category>
                            {commandByCategory[category ?? "general"].map((command, index) => (
                                <Accordion key={`${category}-${index}`}>
                                    <AccordionHeaderText>{command.name}</AccordionHeaderText>
                                    <AccordionBodyContent>
                                        <i>{command.description}</i>
                                        <div className="pl-4">
                                            <div className="flex flex-col py-2">
                                                <span>USAGE:</span>
                                                <code className="mt-2">{`?${command.name}${command.usage ? ` ${command.usage}` : ""}`}</code>
                                            </div>
                                            <div className="flex flex-col py-2">
                                                <span>EXAMPLES:</span>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    {command.examples?.map((c, i) => <code key={`example-${command.name}-${i}`}>{c}</code>) ?? <code>{`?${command.name}`}</code>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col py-2">
                                                <span>ALIASES:</span>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    {command.aliases?.map((a, i) => <code key={`alias-${command.name}-${i}`}>{a}</code>) ?? "None!"}
                                                </div>
                                            </div>
                                            <div className="flex flex-col py-2">
                                                <span>SUB COMMANDS:</span>
                                                <div className="mt-2 flex flex-col gap-1">
                                                    {command.subCommands?.map((c, i) => <code key={`sub-${c.name}-${i}`}>{`?${c.name.split("-").join(" ")} ${c.usage}`}</code>) ??
                                                        "None!"}
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        {command.requiredRole && (
                                            <div className="flex items-center">
                                                <span className="text-sm">ROLES REQUIRED</span>
                                                <span className="ml-2 px-2 role">{command.requiredRole}</span>
                                            </div>
                                        )}
                                    </AccordionBodyContent>
                                </Accordion>
                            ))}
                        </div>
                    ))}
                </div>
            </div> */}
        </LandingPage>
    );
};

export default Commands;
