import { CreatedAt, Entity } from '../../../api/model';
import { Color } from '../../../dynamodb/model/Color';

export type LabelId = Entity<'labelId'>;

interface LabelData {
    title: string;
    color: Color;
    description?: string;
}

export type LabelEntity = LabelId & CreatedAt & LabelData;

export type GetLabelInput = LabelId;
export interface GetLabelOutput {
    label: LabelEntity;
}

export type CreateLabelInput = LabelData;

export type AddLabelInput = LabelId & Partial<Pick<LabelData, 'color'>>;

export type UpdateLabelInput = LabelId & Partial<LabelData>;
export interface UpdateLabelOutput {
    label: LabelId;
}

export interface CreateLabelOutput {
    label: LabelEntity;
}

export type DeleteLabelInput = LabelId;
export interface DeleteLabelOutput {
    success: boolean;
}
