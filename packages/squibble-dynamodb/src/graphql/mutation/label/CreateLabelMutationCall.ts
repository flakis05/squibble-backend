import { CreateLabelInput, CreateLabelOutput } from '../../api/label/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class CreateLabelMutationCall implements MutationCall<CreateLabelInput, CreateLabelOutput> {
    private handler: ApiCallHandler<CreateLabelInput, CreateLabelOutput>;

    constructor(handler: ApiCallHandler<CreateLabelInput, CreateLabelOutput>) {
        this.handler = handler;
    }

    public mutate = (input: CreateLabelInput): Promise<CreateLabelOutput> => {
        return this.handler.handle(input);
    };
}
