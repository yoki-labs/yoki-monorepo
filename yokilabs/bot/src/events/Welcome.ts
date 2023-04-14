import type AbstractClient from "../Client";

export default <TClient extends AbstractClient<any, any, any>>(client: TClient) => {
    // parsing the env variable of operators (string1,string2,string3) and setting to array
    client.operators = process.env.OPERATOR_IDS?.split(",") ?? [];

    // add owner of bot to operators list
    if (client.user) client.operators.push(client.user.createdBy);
};
