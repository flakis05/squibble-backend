import { Attribute } from '../../../../dynamodb/model/Attribute';
import { LabelDynamoDbItem } from '../../../../dynamodb/model/Label';
import { LabelEntity } from '../model';

export const fromDynamoDbItem = (item: LabelDynamoDbItem): LabelEntity => {
    return {
        labelId: item[Attribute.LABEL_ID],
        createdAt: item[Attribute.CREATED_AT],
        title: item[Attribute.TITLE],
        color: item[Attribute.COLOR]
    };
};
