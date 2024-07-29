import { CreatedModifiedAt, DeletedAt, Entity } from '../../../api/model';
import { AddLabelInput, LabelEntity, LabelId } from '../label/model';

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
    labels?: AddLabelInput[];
};
export interface CreateNoteOutput {
    note: NoteEntity;
}

export type AddLabelToNoteInput = NoteId & {
    label: AddLabelInput;
};
export interface AddLabelToNoteOutput {
    note: NoteId;
}

export type RemoveLabelFromNoteInput = NoteId & LabelId;
export interface RemoveLabelFromNoteOutput {
    note: NoteId;
}

export type UpdateNoteInput = NoteId & Partial<Omit<NoteData, 'labels'>>;
export interface UpdateNoteOutput {
    note: NoteId;
}

export type DeleteNoteInput = NoteId;
export interface DeleteNoteOutput {
    success: boolean;
}

export type ArchiveNoteInput = NoteId;
export interface ArchiveNoteOutput {
    note: NoteId;
}

export type UnArchiveNoteInput = NoteId;
export interface UnArchiveNoteOutput {
    note: NoteId;
}
