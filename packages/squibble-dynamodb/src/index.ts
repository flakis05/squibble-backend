import fs from 'fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const resolvers = {
    Query: {
        notes: () => {
            return [{ id: 1 }];
        }
    }
};

const start = async () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== 'production'
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 }
    });
    console.log(`🚀 Server ready at ${url}`);
};

start();
