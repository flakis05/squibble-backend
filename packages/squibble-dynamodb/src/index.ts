import fs from 'fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { documentClient } from './dynamodb/client';
import { Table } from './dynamodb/model/Table';
import { initializeDynamoDbTable } from './dynamodb/setup/table-initializer';
import { DynamoDBClientWrapper } from './dynamodb/wrapper/DynamoDbClientWrapper';
import { CreateNoteInput, CreateNoteOutput } from './graphql/api/note/model';
import { CreateNoteHandler } from './graphql/handler/note/CreateNoteHandler';
import { GetNoteHandler } from './graphql/handler/note/GetNoteHandler';
import { MutationResolver } from './graphql/mutation/MutationResolver';
import { CreateNoteMutationCall } from './graphql/mutation/note/CreateNoteMutationCall';
import { GetNoteResolver } from './graphql/resolver/note/GetNoteResolver';
import { KeySupplier } from './graphql/util/KeySupplier';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const clientWrapper = new DynamoDBClientWrapper(Table.BASE, documentClient);
const keySupplier = new KeySupplier();

const getNoteHandler = new GetNoteHandler(clientWrapper);
const createNoteHandler = new CreateNoteHandler(clientWrapper, keySupplier);

const getNoteResolver = new GetNoteResolver(getNoteHandler);
const createNoteMutationCall = new CreateNoteMutationCall(createNoteHandler);
const createNoteMutationResolver = new MutationResolver<CreateNoteInput, CreateNoteOutput>(createNoteMutationCall);

const resolvers = {
    Query: {
        note: getNoteResolver.resolve,
        notes: () => {
            return [{ id: 1 }];
        }
    },
    Mutation: {
        createNote: createNoteMutationResolver.resolve
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
