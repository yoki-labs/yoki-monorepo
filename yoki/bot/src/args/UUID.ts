import { isUUID } from "../utils/matching";

export default (input: string) => (isUUID(input) ? input : null);
