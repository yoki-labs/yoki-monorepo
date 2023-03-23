import { GraphQLClient } from 'graphql-request';
import { createContext } from 'react';

export const gqlClientContext = createContext(new GraphQLClient(process.env.NODE_ENV === "development" ? "http://localhost:2222" : process.env.API_URL!, { "cache": "no-cache" }));