import fs from 'fs';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { documentClient } from './dynamodb/client';
import { Table } from './dynamodb/model/Table';
import { initializeDynamoDbTable } from './dynamodb/setup/table-initializer';
import { DynamoDBClientWrapper } from './dynamodb/wrapper/DynamoDbClientWrapper';
import {
    AddLabelToNoteInput,
    AddLabelToNoteOutput,
    CreateNoteInput,
    CreateNoteOutput,
    DeleteNoteInput,
    DeleteNoteOutput,
    UpdateNoteInput,
    UpdateNoteOutput
} from './graphql/api/note/model';
import { CreateNoteHandler } from './graphql/handler/note/CreateNoteHandler';
import { GetNoteHandler } from './graphql/handler/note/GetNoteHandler';
import { MutationResolver } from './graphql/mutation/MutationResolver';
import { CreateNoteMutationCall } from './graphql/mutation/note/CreateNoteMutationCall';
import { GetNoteResolver } from './graphql/resolver/note/GetNoteResolver';
import { KeySupplier } from './graphql/util/KeySupplier';
import { AdvancedDynamoDbClientWrapper } from './dynamodb/wrapper/AdvancedDynamoDbClientWrapper';
import { DeleteNoteHandler } from './graphql/handler/note/DeleteNoteHandler';
import { DeleteNoteMutationCall } from './graphql/mutation/note/DeleteNoteMutationCall';
import { CreateLabelInput, CreateLabelOutput, UpdateLabelInput, UpdateLabelOutput } from './graphql/api/label/model';
import { CreateLabelHandler } from './graphql/handler/label/CreateLabelHandler';
import { CreateLabelMutationCall } from './graphql/mutation/label/CreateLabelMutationCall';
import { Color } from './dynamodb/model/Color';
import { AddLabelToNoteMutationCall } from './graphql/mutation/note/AddLabelToNoteMutationCall';
import { AddLabelToNoteHandler } from './graphql/handler/note/AddLabelToNoteHandler';
import { UpdateNoteHandler } from './graphql/handler/note/UpdateNoteHandler';
import { UpdateNoteMutationCall } from './graphql/mutation/note/UpdateNoteMutationCall';
import { UpdateLabelHandler } from './graphql/handler/label/UpdateLabelHandler';
import { UpdateLabelMutationCall } from './graphql/mutation/label/UpdateLabelMutationCall';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const maxBatchGetSize = 100;
const maxBatchWriteSize = 25;

const clientWrapper = new DynamoDBClientWrapper(Table.BASE, documentClient);
const advancedlientWrapper = new AdvancedDynamoDbClientWrapper(documentClient, maxBatchGetSize, maxBatchWriteSize);
const keySupplier = new KeySupplier();

const getNoteHandler = new GetNoteHandler(clientWrapper, advancedlientWrapper);
const createNoteHandler = new CreateNoteHandler(advancedlientWrapper, keySupplier);
const addLabelToNoteHandler = new AddLabelToNoteHandler(clientWrapper);
const updateNoteHandler = new UpdateNoteHandler(clientWrapper);
const createLabelHandler = new CreateLabelHandler(clientWrapper, keySupplier);
const updateLabelHandler = new UpdateLabelHandler(clientWrapper);
const deleteNoteHandler = new DeleteNoteHandler(clientWrapper);

const getNoteResolver = new GetNoteResolver(getNoteHandler);

const createNoteMutationCall = new CreateNoteMutationCall(createNoteHandler);
const createNoteMutationResolver = new MutationResolver<CreateNoteInput, CreateNoteOutput>(createNoteMutationCall);
const addLabelToNoteMutationCall = new AddLabelToNoteMutationCall(addLabelToNoteHandler);
const addLabelToNoteMutationResolver = new MutationResolver<AddLabelToNoteInput, AddLabelToNoteOutput>(
    addLabelToNoteMutationCall
);
const updateNoteMutationCall = new UpdateNoteMutationCall(updateNoteHandler);
const updateNoteMutationResolver = new MutationResolver<UpdateNoteInput, UpdateNoteOutput>(updateNoteMutationCall);
const createLabelMutationCall = new CreateLabelMutationCall(createLabelHandler);
const createLabelMutationResolver = new MutationResolver<CreateLabelInput, CreateLabelOutput>(createLabelMutationCall);
const updateLabelMutationCall = new UpdateLabelMutationCall(updateLabelHandler);
const updateLabelMutationResolver = new MutationResolver<UpdateLabelInput, UpdateLabelOutput>(updateLabelMutationCall);
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
        addLabelToNote: addLabelToNoteMutationResolver.resolve,
        updateNote: updateNoteMutationResolver.resolve,
        createLabel: createLabelMutationResolver.resolve,
        updateLabel: updateLabelMutationResolver.resolve,
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
