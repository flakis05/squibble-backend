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
    ArchiveNoteInput,
    ArchiveNoteOutput,
    CreateNoteInput,
    CreateNoteOutput,
    DeleteNoteInput,
    DeleteNoteOutput,
    RemoveLabelFromNoteInput,
    RemoveLabelFromNoteOutput,
    SortActiveNotesBy,
    UnArchiveNoteInput,
    UnArchiveNoteOutput,
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
import {
    CreateLabelInput,
    CreateLabelOutput,
    DeleteLabelInput,
    DeleteLabelOutput,
    UpdateLabelInput,
    UpdateLabelOutput
} from './graphql/api/label/model';
import { CreateLabelHandler } from './graphql/handler/label/CreateLabelHandler';
import { CreateLabelMutationCall } from './graphql/mutation/label/CreateLabelMutationCall';
import { Color } from './dynamodb/model/Color';
import { AddLabelToNoteMutationCall } from './graphql/mutation/note/AddLabelToNoteMutationCall';
import { AddLabelToNoteHandler } from './graphql/handler/note/AddLabelToNoteHandler';
import { UpdateNoteHandler } from './graphql/handler/note/UpdateNoteHandler';
import { UpdateNoteMutationCall } from './graphql/mutation/note/UpdateNoteMutationCall';
import { UpdateLabelHandler } from './graphql/handler/label/UpdateLabelHandler';
import { UpdateLabelMutationCall } from './graphql/mutation/label/UpdateLabelMutationCall';
import { DeleteLabelHandler } from './graphql/handler/label/DeleteLabelHandler';
import { DeleteLabelMutationCall } from './graphql/mutation/label/DeleteLabelMutationCall';
import { ArchiveNoteHandler } from './graphql/handler/note/ArchiveNoteHandler';
import { ArchiveNoteMutationCall } from './graphql/mutation/note/ArchiveNoteMutationCall';
import { UnArchiveNoteHandler } from './graphql/handler/note/UnArchiveNoteHandler';
import { UnArchiveNoteMutationCall } from './graphql/mutation/note/UnArchiveNoteMutationCall';
import { RemoveLabelFromNoteMutationCall } from './graphql/mutation/note/RemoveLabelFromNoteMutationCall';
import { RemoveLabelFromNoteHandler } from './graphql/handler/note/RemoveLabelFromNoteHandler';
import { GetActiveNotesHandler } from './graphql/handler/note/GetActiveNotesHandler';
import { QueryHandler } from './graphql/handler/shared/QueryHandler';
import { Base64Encoder } from './graphql/util/Base64Encoder';
import { GetNotesResolver } from './graphql/resolver/note/GetNotesResolver';
import { SortDirection } from './graphql/api/shared/model';
import { getApolloContext } from './graphql/context/ApolloContext';
import DataLoader from 'dataloader';
import { GetLabelDataLoader } from './graphql/dataloader/GetLabelDataLoader';
import { GetLabelsResolver } from './graphql/resolver/label/GetLabelsResolver';
import { GetArchivesResolver } from './graphql/resolver/note/GetArchivesResolver';

const typeDefs = fs.readFileSync('generated/schema/merged.graphql', 'utf8');

const maxBatchGetSize = 100;
const maxBatchWriteSize = 25;

const clientWrapper = new DynamoDBClientWrapper(Table.BASE, documentClient);
const advancedlientWrapper = new AdvancedDynamoDbClientWrapper(documentClient, maxBatchGetSize, maxBatchWriteSize);
const keySupplier = new KeySupplier();
const base64Encoder = new Base64Encoder();

const getLabelDataLoader = new GetLabelDataLoader(advancedlientWrapper);

const queryHandler = new QueryHandler(advancedlientWrapper, base64Encoder);
const getNoteHandler = new GetNoteHandler(clientWrapper, advancedlientWrapper);
const getActiveNotesHandler = new GetActiveNotesHandler(queryHandler);
const createNoteHandler = new CreateNoteHandler(advancedlientWrapper, keySupplier);
const addLabelToNoteHandler = new AddLabelToNoteHandler(advancedlientWrapper);
const removeLabelFromNoteHandler = new RemoveLabelFromNoteHandler(advancedlientWrapper);
const updateNoteHandler = new UpdateNoteHandler(clientWrapper);
const archiveNoteHandler = new ArchiveNoteHandler(clientWrapper);
const unArchiveNoteHandler = new UnArchiveNoteHandler(clientWrapper);
const deleteNoteHandler = new DeleteNoteHandler(clientWrapper);
const createLabelHandler = new CreateLabelHandler(clientWrapper, keySupplier);
const updateLabelHandler = new UpdateLabelHandler(clientWrapper);
const deleteLabelHandler = new DeleteLabelHandler(clientWrapper);

const getNoteResolver = new GetNoteResolver(getNoteHandler);
const getLabelsResolver = new GetLabelsResolver();
const getNotesResolver = new GetNotesResolver(getActiveNotesHandler);
const getArchivesResolver = new GetArchivesResolver(getActiveNotesHandler);

const createNoteMutationCall = new CreateNoteMutationCall(createNoteHandler);
const createNoteMutationResolver = new MutationResolver<CreateNoteInput, CreateNoteOutput>(createNoteMutationCall);
const addLabelToNoteMutationCall = new AddLabelToNoteMutationCall(addLabelToNoteHandler);
const addLabelToNoteMutationResolver = new MutationResolver<AddLabelToNoteInput, AddLabelToNoteOutput>(
    addLabelToNoteMutationCall
);
const removeLabelFromNoteMutationCall = new RemoveLabelFromNoteMutationCall(removeLabelFromNoteHandler);
const removeLabelFromNoteMutationResolver = new MutationResolver<RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput>(
    removeLabelFromNoteMutationCall
);
const updateNoteMutationCall = new UpdateNoteMutationCall(updateNoteHandler);
const updateNoteMutationResolver = new MutationResolver<UpdateNoteInput, UpdateNoteOutput>(updateNoteMutationCall);
const deleteNoteMutationCall = new DeleteNoteMutationCall(deleteNoteHandler);
const deleteNoteMutationResolver = new MutationResolver<DeleteNoteInput, DeleteNoteOutput>(deleteNoteMutationCall);
const archiveNoteMutationCall = new ArchiveNoteMutationCall(archiveNoteHandler);
const archiveNoteMutationResolver = new MutationResolver<ArchiveNoteInput, ArchiveNoteOutput>(archiveNoteMutationCall);
const unArchiveNoteMutationCall = new UnArchiveNoteMutationCall(unArchiveNoteHandler);
const unArchiveNoteMutationResolver = new MutationResolver<UnArchiveNoteInput, UnArchiveNoteOutput>(
    unArchiveNoteMutationCall
);
const createLabelMutationCall = new CreateLabelMutationCall(createLabelHandler);
const createLabelMutationResolver = new MutationResolver<CreateLabelInput, CreateLabelOutput>(createLabelMutationCall);
const updateLabelMutationCall = new UpdateLabelMutationCall(updateLabelHandler);
const updateLabelMutationResolver = new MutationResolver<UpdateLabelInput, UpdateLabelOutput>(updateLabelMutationCall);
const deleteLabelMutationCall = new DeleteLabelMutationCall(deleteLabelHandler);
const deleteLabelMutationResolver = new MutationResolver<DeleteLabelInput, DeleteLabelOutput>(deleteLabelMutationCall);
const resolvers = {
    Query: {
        note: getNoteResolver.resolve,
        notes: getNotesResolver.resolve,
        archives: getArchivesResolver.resolve
    },
    Mutation: {
        createNote: createNoteMutationResolver.resolve,
        addLabelToNote: addLabelToNoteMutationResolver.resolve,
        removeLabelFromNote: removeLabelFromNoteMutationResolver.resolve,
        updateNote: updateNoteMutationResolver.resolve,
        deleteNote: deleteNoteMutationResolver.resolve,
        archiveNote: archiveNoteMutationResolver.resolve,
        unArchiveNote: unArchiveNoteMutationResolver.resolve,
        createLabel: createLabelMutationResolver.resolve,
        updateLabel: updateLabelMutationResolver.resolve,
        deleteLabel: deleteLabelMutationResolver.resolve
    },
    Note: {
        labels: getLabelsResolver.resolve
    },
    Color,
    SortDirection,
    SortActiveNotesBy
};

const start = async () => {
    if (process.env.NODE_ENV === 'development') {
        await initializeDynamoDbTable(createNoteHandler, createLabelHandler);
    }

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        introspection: process.env.NODE_ENV !== 'production'
    });
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async () => {
            return getApolloContext({
                GetLabel: new DataLoader(getLabelDataLoader.load)
            });
        }
    });
    console.log(`🚀 Server ready at ${url}`);
};

start();
