import fs from 'fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { documentClient } from './dynamodb/client';
import { Table } from './dynamodb/model/Table';
import { initializeDynamoDbTable } from './dynamodb/setup/table-initializer';
import { DynamoDBClientWrapper } from './dynamodb/wrapper/DynamoDbClientWrapper';
import { CreateNoteInput, CreateNoteOutput, DeleteNoteInput, DeleteNoteOutput } from './graphql/api/note/model';
import { CreateNoteHandler } from './graphql/handler/note/CreateNoteHandler';
import { GetNoteHandler } from './graphql/handler/note/GetNoteHandler';
import { MutationResolver } from './graphql/mutation/MutationResolver';
import { CreateNoteMutationCall } from './graphql/mutation/note/CreateNoteMutationCall';
import { GetNoteResolver } from './graphql/resolver/note/GetNoteResolver';
import { KeySupplier } from './graphql/util/KeySupplier';
import { AdvancedDynamoDbClientWrapper } from './dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { DeleteNoteHandler } from './graphql/handler/note/DeleteNoteHandler';
import { DeleteNoteMutationCall } from './graphql/mutation/note/DeleteNoteMutationCall';
import { CreateLabelInput, CreateLabelOutput } from './graphql/api/label/model';
import { CreateLabelHandler } from './graphql/handler/label/CreateLabelHandler';
import { CreateLabelMutationCall } from './graphql/mutation/label/CreateLabelMutationCall';
import { Color } from './dynamodb/model/Color';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const maxBatchGetSize = 100;
const maxBatchWriteSize = 25;

const clientWrapper = new DynamoDBClientWrapper(Table.BASE, documentClient);
const advancedlientWrapper = new AdvancedDynamoDbClientWrapper(documentClient, maxBatchGetSize, maxBatchWriteSize);
const keySupplier = new KeySupplier();

const getNoteHandler = new GetNoteHandler(clientWrapper, advancedlientWrapper);
const createNoteHandler = new CreateNoteHandler(advancedlientWrapper, keySupplier);
const createLabelHandler = new CreateLabelHandler(clientWrapper, keySupplier);
const deleteNoteHandler = new DeleteNoteHandler(clientWrapper);

const getNoteResolver = new GetNoteResolver(getNoteHandler);

const createNoteMutationCall = new CreateNoteMutationCall(createNoteHandler);
const createNoteMutationResolver = new MutationResolver<CreateNoteInput, CreateNoteOutput>(createNoteMutationCall);
const createLabelMutationCall = new CreateLabelMutationCall(createLabelHandler);
const createLabelMutationResolver = new MutationResolver<CreateLabelInput, CreateLabelOutput>(createLabelMutationCall);
const deleteNoteMutationCall = new DeleteNoteMutationCall(deleteNoteHandler);
const deleteNoteMutationResolver = new MutationResolver<DeleteNoteInput, DeleteNoteOutput>(deleteNoteMutationCall);

const resolvers = {
    Query: {
        note: getNoteResolver.resolve,
        notes: () => {
            return [{ id: 1 }];
        }
    },
    Mutation: {
        createNote: createNoteMutationResolver.resolve,
        createLabel: createLabelMutationResolver.resolve,
        deleteNote: deleteNoteMutationResolver.resolve
    },
    Color
};

const start = async () => {
    if (process.env.NODE_ENV === 'development') {
        await initializeDynamoDbTable(Table.BASE, createNoteHandler, createLabelHandler);
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
