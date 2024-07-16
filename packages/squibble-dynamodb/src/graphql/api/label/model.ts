import { CreatedAt, Entity } from '../../../api/model';
import { Color } from '../../../dynamodb/model/Color';

export type LabelId = Entity<'labelId'>;

interface LabelData {
    title: string;
    color: Color;
}

export type LabelEntity = LabelId & CreatedAt & LabelData;

export type CreateNoteWithLabelInput = LabelId & Pick<LabelData, 'color'>;

export type CreateLabelInput = LabelData;

export interface CreateLabelOutput {
    label: LabelEntity;
}
