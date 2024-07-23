import { UpdateLabelInput, UpdateLabelOutput } from '../../api/label/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class UpdateLabelMutationCall implements MutationCall<UpdateLabelInput, UpdateLabelOutput> {
    private handler: ApiCallHandler<UpdateLabelInput, UpdateLabelOutput>;

    constructor(handler: ApiCallHandler<UpdateLabelInput, UpdateLabelOutput>) {
        this.handler = handler;
    }

    public mutate = (input: UpdateLabelInput): Promise<UpdateLabelOutput> => {
        return this.handler.handle(input);
    };
}
