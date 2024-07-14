import { CreatedModifiedAt, Entity } from '../../../api/model';
import { ExistingLabelInput, LabelEntity } from '../label/model';

export type NoteId = Entity<'noteId'>;

interface NoteData {
    title?: string;
    content: string;
    labels?: LabelEntity[];
}

export type NoteEntity = NoteId & CreatedModifiedAt & NoteData;

export type CreateNoteInput = Omit<NoteData, 'labels'> & {
    labels?: ExistingLabelInput[];
};

export interface CreateNoteOutput {
    note: NoteEntity;
}

export type GetNoteInput = NoteId;
export interface GetNoteOutput {
    note: NoteEntity;
}
