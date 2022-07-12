import { Accordion, AccordionBody, AccordionHeader } from "@material-tailwind/react";
import type { NextPage } from "next";
import { useState } from "react";

import commands from "../commands.json";
import { Command } from "../lib/Command";

interface GroupedCommands {
    [x: string]: Command[];
}

export const getStaticProps = () => {
    const commandByCategory = commands.reduce<GroupedCommands>((group, command) => {
        const category = command.category ?? "general";
        group[category] = group[category] ?? [];
        group[category].push(command);
        return group;
    }, {});

    return {
        props: { commandByCategory },
    };
};

const Commands: NextPage<{ commandByCategory: GroupedCommands }> = ({ commandByCategory }) => {
    const [open, setOpen] = useState<string | null>(null);

    const handleOpen = (value: string) => {
        setOpen(open === value ? null : value);
    };

    return (
        <div className="pt-8 space-y-5 px-14">
            {Object.keys(commandByCategory).map((category) => (
                <div className="space-y-5" key={category}>
                    <h1 className="text-3xl text-white font-bold pb-2">{category.charAt(0).toUpperCase() + category.slice(1)}</h1>
                    {commandByCategory[category ?? "general"].map((command, index) => {
                        return (
                            <Accordion
                                key={`${category}-${index}`}
                                open={open === `${category}-${index}`}
                                className="bg-custom-gray text-white rounded-md w-full md:w-full py-1 px-10"
                            >
                                <AccordionHeader onClick={() => handleOpen(`${category}-${index}`)}>
                                    <h1 className="text-xl text-white font-semibold">{command.name}</h1>
                                </AccordionHeader>
                                <AccordionBody>
                                    <p className="text-white">Description: {command.description}</p>
                                    <p className="text-white">Examples: {command.examples?.join(", ") ?? `?${command.name}`}</p>
                                    <p className="text-white">Usage: {`?${command.name}${command.usage ? ` ${command.usage}` : ""}`}</p>
                                    <p className="text-white">Aliases: {command.aliases?.join(", ") ?? "N/A"}</p>
                                    <p className="text-white">Subcommands: {command.subCommands?.map((x) => x.name).join(", ") ?? "None"}</p>
                                    <p className="text-white">Required Role: {command.requiredRole ?? "None"}</p>
                                    {command.args?.length ? (
                                        <div className="pt-4">
                                            <p className="text-xl text-white">Args:</p>
                                            <ol className="list-decimal text-white pl-8 pt-1">
                                                {command.args.map((x) => (
                                                    <li key={`${category}-${index}-${x.name}`}>
                                                        {x.name} - {x.type}
                                                        {x.optional ? ` (OPTIONAL)` : ""}
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </AccordionBody>
                            </Accordion>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Commands;
