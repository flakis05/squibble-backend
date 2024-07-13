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
import { KeySupplier } from './graphql/util/KeySupplier';
import { MutationResolver } from './graphql/MutationResolver';
import { CreateNoteInput, CreateNoteOutput } from './graphql/note/api/model';
import { CreateNoteMutationCall } from './graphql/note/mutation/CreateNoteMutationCall';
import { CreateNoteHandler } from './graphql/note/handler/CreateNoteHandler';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const clientWrapper = new DynamoDBClientWrapper(Table.BASE, documentClient);
const keySupplier = new KeySupplier();

const noteFactory = new NoteFactory(keySupplier);

const getNoteHandler = new GetNoteHandler(clientWrapper, noteFactory);
const createNoteHandler = new CreateNoteHandler(clientWrapper, noteFactory);

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
