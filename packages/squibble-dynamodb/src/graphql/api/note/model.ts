import { ArchivedAt, CreatedModifiedAt, DeletedAt, Entity } from '../../../api/model';
import { NoteStatus } from '../../../dynamodb/model/Note';
import { AddLabelInput, LabelEntity, LabelId } from '../label/model';
import { Connection, SortDirection } from '../shared/model';

export type NoteId = Entity<'noteId'>;

interface NoteData {
    title?: string;
    content: string;
    labels?: LabelEntity[];
}

export type NoteEntity = NoteId & CreatedModifiedAt & DeletedAt & ArchivedAt & NoteData;

export type GetNoteInput = NoteId & {
    status: NoteStatus;
};
export interface GetNoteOutput {
    note: NoteEntity;
}

type GetNotesInputBase = NoteId & {
    limit: number;
    after?: string;
    sort: SortNotes;
    status: NoteStatus;
};
export type GetNotesInput = GetNotesInputBase & {
    status: Extract<NoteStatus, 'active' | 'archived'>;
};
export type GetDeletedNotesInput = Omit<GetNotesInputBase, 'sort' | 'status'> & {
    sort: SortDeletedNotes;
};
export type GetNotesOutput = Connection<NoteEntity>;

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

export enum SortNotesBy {
    MODIFIED_DATE = 'modifiedDate',
    CREATED_DATE = 'createdDate'
}
export interface SortNotes {
    direction: SortDirection;
    by: SortNotesBy;
}

export enum SortDeletedNotesBy {
    DELETED_DATE = 'deletedDate'
}
export interface SortDeletedNotes {
    direction: SortDirection;
    by: SortDeletedNotesBy;
}
