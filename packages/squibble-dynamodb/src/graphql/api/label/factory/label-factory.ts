import { Attribute } from '../../../../dynamodb/model/Attribute';
import { LabelDynamoDbItem, LabelOverride } from '../../../../dynamodb/model/Label';
import { RuntimeException } from '../../../exception/RuntimeException';
import { LabelEntity } from '../model';

export const fromDynamoDbItem = (item: LabelDynamoDbItem, labelOverride?: LabelOverride): LabelEntity => {
    if (labelOverride && item.labelId !== labelOverride.labelId) {
        throw new RuntimeException('Label override should have the same id as label dynamodb item');
    }
    return {
        labelId: item[Attribute.LABEL_ID],
        title: item[Attribute.TITLE],
        color: labelOverride?.color ?? item[Attribute.COLOR],
        createdAt: labelOverride?.addedAt ?? item[Attribute.CREATED_AT]
    };
};
