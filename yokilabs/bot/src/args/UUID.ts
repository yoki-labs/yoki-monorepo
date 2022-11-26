import { isUUID } from "@yokilabs/util";

export default (input: string) => (isUUID(input) ? input : null);
