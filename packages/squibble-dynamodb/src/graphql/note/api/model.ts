import { CreatedModifiedAt, Entity } from '../../../api/model';

type NoteId = Entity<'noteId'>;

interface NoteData {
    title?: string;
    content: string;
}

export type NoteEntity = NoteId & CreatedModifiedAt & NoteData;

export type CreateNoteInput = NoteData;

export interface CreateNoteOutput {
    note: NoteEntity;
}

export type GetNoteInput = NoteId;
export interface GetNoteOutput {
    note: NoteEntity;
}
