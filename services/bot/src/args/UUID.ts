import { isUUID } from "../utils/util";

export default (input: string) => (isUUID(input) ? input : null);
