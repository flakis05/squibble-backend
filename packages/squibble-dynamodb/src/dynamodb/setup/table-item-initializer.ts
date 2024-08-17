import { CreateLabelInput, CreateLabelOutput, LabelId } from '../../graphql/api/label/model';
import {
    AddLabelToNoteInput,
    AddLabelToNoteOutput,
    ArchiveNoteInput,
    ArchiveNoteOutput,
    CreateNoteInput,
    CreateNoteOutput,
    DeleteNoteInput,
    DeleteNoteOutput,
    NoteId
} from '../../graphql/api/note/model';
import { ApiCallHandler } from '../../graphql/handler/ApiCallHandler';
import data from '../../resources/data/local-initial-data.json';

export const initializeItemsInTable = async (
    createNoteHandler: ApiCallHandler<CreateNoteInput, CreateNoteOutput>,
    createLabelHandler: ApiCallHandler<CreateLabelInput, CreateLabelOutput>,
    addLabelToNoteHandler: ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput>,
    archiveNoteHandler: ApiCallHandler<ArchiveNoteInput, ArchiveNoteOutput>,
    deleteNoteHandler: ApiCallHandler<DeleteNoteInput, DeleteNoteOutput>
) => {
    console.log('Initializing DynamoDb items');
    const createNotePromises = data.notes.map((item) => createNoteHandler.handle(item));
    const createLabelPromises = data.labels.map((item) => createLabelHandler.handle(item as CreateLabelInput));

    const notes: NoteId[] = (await Promise.all(createNotePromises)).map((output) => ({ noteId: output.note.noteId }));
    const labels: LabelId[] = (await Promise.all(createLabelPromises)).map((output) => ({
        labelId: output.label.labelId
    }));
    await addLabelsToNote(notes, labels, addLabelToNoteHandler);
    await archiveAndDeleteSomeNotes(notes, archiveNoteHandler, deleteNoteHandler);
    console.log('Initialized DynamoDb Items');
};

const addLabelsToNote = async (
    notes: NoteId[],
    labels: LabelId[],
    addLabelToNoteHandler: ApiCallHandler<AddLabelToNoteInput, AddLabelToNoteOutput>
) => {
    const notesWithLabels = getRandomDistinctElements<NoteId>(notes, 50, 100);
    const noteLabels = notesWithLabels.reduce(
        (acc, note) => {
            acc[note.noteId] = getRandomDistinctElements<LabelId>(labels, 50, 100);
            return acc;
        },
        {} as Record<string, LabelId[]>
    );
    const addLabelToNotePromises = notesWithLabels.flatMap((note) =>
        noteLabels[note.noteId].map((label) =>
            addLabelToNoteHandler.handle({ noteId: note.noteId, label: { labelId: label.labelId } })
        )
    );
    await Promise.all(addLabelToNotePromises);
};

const archiveAndDeleteSomeNotes = async (
    notes: NoteId[],
    archiveNoteHandler: ApiCallHandler<ArchiveNoteInput, ArchiveNoteOutput>,
    deleteNoteHandler: ApiCallHandler<DeleteNoteInput, DeleteNoteOutput>
) => {
    const notesToArchive = getRandomDistinctElements<NoteId>(notes, 30, 50);
    const notesToDelete = getRandomDistinctElements<NoteId>(notesToArchive, 10, 10);
    await archiveNotes(
        notesToArchive.filter((note) => !notesToDelete.includes(note)),
        archiveNoteHandler
    );
    await deleteNotes(notesToDelete, deleteNoteHandler);
};

const archiveNotes = async (
    notes: NoteId[],
    archiveNoteHandler: ApiCallHandler<ArchiveNoteInput, ArchiveNoteOutput>
) => {
    const archiveNotePromises = notes.map((item) => archiveNoteHandler.handle(item));
    await Promise.all(archiveNotePromises);
};

const deleteNotes = async (notes: NoteId[], deleteNoteHandler: ApiCallHandler<DeleteNoteInput, DeleteNoteOutput>) => {
    const deleteNotePromises = notes.map((item) => deleteNoteHandler.handle(item));
    await Promise.all(deleteNotePromises);
};

const getRandomDistinctElements = <T>(data: T[], minPercentage: number, maxPercentage: number): T[] => {
    if (minPercentage < 0 || maxPercentage > 100 || minPercentage > maxPercentage) {
        throw new Error(`Invalid percentage range: min(${minPercentage}), max${maxPercentage})`);
    }

    const randomPercentage = Math.random() * (maxPercentage - minPercentage) + minPercentage;

    const amount = Math.floor((randomPercentage / 100) * data.length);
    const dataCopy = [...data];

    // Shuffle the array using the Fisher-Yates algorithm
    for (let i = dataCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dataCopy[i], dataCopy[j]] = [dataCopy[j], dataCopy[i]];
    }

    return dataCopy.slice(0, amount);
};
