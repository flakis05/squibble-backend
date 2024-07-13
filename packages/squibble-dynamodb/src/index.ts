import fs from 'fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GetNoteResolver } from './graphql/note/resolver/GetNoteResolver';
import { GetNoteHandler } from './graphql/note/handler/GetNoteHandler';
import { NoteFactory } from './graphql/note/api/factory/NoteFactory';
import { DynamoDBClientWrapper } from './dynamodb/wrapper/DynamoDbClientWrapper';
import { documentClient } from './dynamodb/client';
import { Table } from './dynamodb/model/Table';
import { initializeDynamoDbTable } from './dynamodb/setup/table-initializer';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const clientWrapper = new DynamoDBClientWrapper(Table.BASE, documentClient);

const noteFactory = new NoteFactory();

const getNoteHandler = new GetNoteHandler(clientWrapper, noteFactory);

const getNoteResolver = new GetNoteResolver(getNoteHandler);

const resolvers = {
    Query: {
        note: getNoteResolver.resolve,
        notes: () => {
            return [{ id: 1 }];
        }
    }
};

const start = async () => {
    if (process.env.NODE_ENV === 'development') {
        await initializeDynamoDbTable(Table.BASE);
    }

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
