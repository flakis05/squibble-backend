import { DeleteLabelInput, DeleteLabelOutput } from '../../api/label/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class DeleteLabelMutationCall implements MutationCall<DeleteLabelInput, DeleteLabelOutput> {
    private handler: ApiCallHandler<DeleteLabelInput, DeleteLabelOutput>;

    constructor(handler: ApiCallHandler<DeleteLabelInput, DeleteLabelOutput>) {
        this.handler = handler;
    }

    public mutate = (input: DeleteLabelInput): Promise<DeleteLabelOutput> => {
        return this.handler.handle(input);
    };
}
