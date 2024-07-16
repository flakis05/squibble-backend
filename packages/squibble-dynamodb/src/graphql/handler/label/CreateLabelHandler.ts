import { WithDateNow } from '../../../api/model';
import { buildBasePrimaryKey } from '../../../dynamodb/key/label-key-factory';
import { LabelDynamoDbItem } from '../../../dynamodb/model/Label';
import { DynamoDBClientWrapper } from '../../../dynamodb/wrapper/DynamoDbClientWrapper';
import { fromDynamoDbItem } from '../../api/label/factory/label-factory';
import { CreateLabelInput, CreateLabelOutput, LabelId } from '../../api/label/model';
import { KeySupplier } from '../../util/KeySupplier';
import { ApiCallHandler } from '../ApiCallHandler';

export class CreateLabelHandler implements ApiCallHandler<CreateLabelInput, CreateLabelOutput> {
    private client: DynamoDBClientWrapper;
    private keySupplier: KeySupplier;
    constructor(client: DynamoDBClientWrapper, keySupplier: KeySupplier) {
        this.client = client;
        this.keySupplier = keySupplier;
    }
    public handle = async (input: CreateLabelInput): Promise<CreateLabelOutput> => {
        console.log(input);
        const dateNow = new Date().toISOString();
        const labelId = this.keySupplier.get();
        const labelDynamoDbItem = this.createLabelDynamoDbItem({ dateNow, labelId, ...input });
        await this.client.create(labelDynamoDbItem);

        return {
            label: fromDynamoDbItem(labelDynamoDbItem)
        };
    };

    private createLabelDynamoDbItem = (input: WithDateNow<CreateLabelInput & LabelId>): LabelDynamoDbItem => {
        return {
            ...buildBasePrimaryKey(input.labelId),
            createdAt: input.dateNow,
            labelId: input.labelId,
            title: input.title,
            color: input.color
        };
    };
}
