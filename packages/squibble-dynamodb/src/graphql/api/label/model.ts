import { CreatedAt, Entity } from '../../../api/model';

type LabelId = Entity<'labelId'>;

interface LabelData {
    title: string;
}

export type LabelEntity = LabelId & CreatedAt & LabelData;

export type ExistingLabelInput = LabelId;
