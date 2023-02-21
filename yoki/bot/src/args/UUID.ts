import type { CommandArgValidator } from "../commands/Command";
import { isUUID } from "../utils/matching";

export default [(input: string) => (isUUID(input) ? input : null), (_arg) => "Your input is not a valid Guilded ID. If you do not know how to get an ID, please read [this article](https://support.guilded.gg/hc/en-us/articles/6183962129303-Developer-mode)."] satisfies CommandArgValidator;
