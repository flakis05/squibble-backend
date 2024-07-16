import { CreatedModifiedAt, DeletedAt, Entity } from '../../../api/model';
import { CreateNoteWithLabelInput, LabelEntity } from '../label/model';

export type NoteId = Entity<'noteId'>;

interface NoteData {
    title?: string;
    content: string;
    labels?: LabelEntity[];
}

export type NoteEntity = NoteId & CreatedModifiedAt & DeletedAt & NoteData;

export type GetNoteInput = NoteId;
export interface GetNoteOutput {
    note: NoteEntity;
}

export type CreateNoteInput = Omit<NoteData, 'labels'> & {
    labels?: CreateNoteWithLabelInput[];
};
export interface CreateNoteOutput {
    note: NoteEntity;
}

export type DeleteNoteInput = NoteId;
export interface DeleteNoteOutput {
    success: boolean;
}
