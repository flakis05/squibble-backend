import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { WithDateNow } from '../../../api/model';
import { LabelDynamoDbItem } from '../../../dynamodb/model/Label';
import { UpdatedDynamoDbItem } from '../../../dynamodb/model/DynamoDbItem';
import { createLabelBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { DeleteLabelInput, DeleteLabelOutput } from '../../api/label/model';
import { ApiCallHandler } from '../ApiCallHandler';

export class DeleteLabelHandler implements ApiCallHandler<DeleteLabelInput, DeleteLabelOutput> {
    private client: DynamoDBClientWrapper;
    constructor(client: DynamoDBClientWrapper) {
        this.client = client;
    }
    public handle = async (input: DeleteLabelInput): Promise<DeleteLabelOutput> => {
        const dateNow = new Date().toISOString();
        const key = createLabelBasePrimaryKey(input.labelId);
        const noteDynamoDbItem = this.createUpdatedLabelDynamoDbItem({ dateNow, ...input });

        await this.client.update(key, noteDynamoDbItem);

        return {
            success: true
        };
    };

    private createUpdatedLabelDynamoDbItem = (
        input: WithDateNow<DeleteLabelInput>
    ): UpdatedDynamoDbItem<LabelDynamoDbItem> => {
        return {
            deletedAt: input.dateNow
        };
    };
}
