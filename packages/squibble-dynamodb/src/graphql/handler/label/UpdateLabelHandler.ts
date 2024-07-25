import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { UpdateLabelInput, UpdateLabelOutput } from '../../api/label/model';
import { createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { LabelDynamoDbItem } from '../../../dynamodb/model/Label';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';

export class UpdateLabelHandler implements ApiCallHandler<UpdateLabelInput, UpdateLabelOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: UpdateLabelInput): Promise<UpdateLabelOutput> => {
        const key = createLabelBasePrimaryKey(input.labelId);
        const labelDynamoDbItem = this.createUpdatedLabelDynamoDbItem(input);

        await this.client.update(key, labelDynamoDbItem);

        return {
            label: {
                labelId: input.labelId
            }
        };
    };

    private createUpdatedLabelDynamoDbItem = (input: UpdateLabelInput): UpdatedDynamoDbItem<LabelDynamoDbItem> => {
        return {
            ...input
        };
    };
}
