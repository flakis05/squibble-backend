import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { ApiCallHandler } from '../ApiCallHandler';
import { UpdateLabelInput, UpdateLabelOutput } from '../../api/label/model';
import { createBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { BasePrimaryKey } from '../../../dynamodb/model/Key';
import { LabelDynamoDbItem } from '../../../dynamodb/model/Label';

export class UpdateLabelHandler implements ApiCallHandler<UpdateLabelInput, UpdateLabelOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: UpdateLabelInput): Promise<UpdateLabelOutput> => {
        const key = createBasePrimaryKey(input.labelId);
        const labelDynamoDbItem = this.createUpdatedLabelDynamoDbItem(input);

        await this.client.update(key, labelDynamoDbItem);

        return {
            label: {
                labelId: input.labelId
            }
        };
    };

    private createUpdatedLabelDynamoDbItem = (
        input: UpdateLabelInput
    ): Partial<Omit<LabelDynamoDbItem, keyof BasePrimaryKey>> => {
        return {
            ...input
        };
    };
}
