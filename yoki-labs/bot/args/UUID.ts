import { isUUID } from "../../util";

export default (input: string) => (isUUID(input) ? input : null);
