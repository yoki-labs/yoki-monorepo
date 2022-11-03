import { readFile, writeFile } from "fs/promises";
import { join } from "path";

void (async () => {
    const reactions = JSON.parse(await readFile(join(__dirname, "reactions-stripped.json"), "utf-8"));
    const transformedObj = {};

    Object.keys(reactions).forEach((x) => (transformedObj[reactions[x].name] = x));
    await writeFile(join(__dirname, "..", "src", "static", "reactions.json"), JSON.stringify(transformedObj));
})();
