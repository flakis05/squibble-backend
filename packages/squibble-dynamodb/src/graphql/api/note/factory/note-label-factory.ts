import { WithDateNow } from '../../../../api/model';
import { createNoteLabelBasePrimaryKey } from '../../../../dynamodb/key/note-label-key-factory';
import { NoteLabelDynamoDbItem } from '../../../../dynamodb/model/NoteLabel';
import { AddLabelToNoteInput } from '../model';

export const createNoteLabelDynamoDbItem = (input: WithDateNow<AddLabelToNoteInput>): NoteLabelDynamoDbItem => ({
    ...createNoteLabelBasePrimaryKey(input.noteId, input.label.labelId),
    noteId: input.noteId,
    labelId: input.label.labelId,
    createdAt: input.dateNow
});
