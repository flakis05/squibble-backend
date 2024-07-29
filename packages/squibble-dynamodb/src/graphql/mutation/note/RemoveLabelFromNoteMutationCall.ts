import { RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class RemoveLabelFromNoteMutationCall
    implements MutationCall<RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput>
{
    private handler: ApiCallHandler<RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput>;

    constructor(handler: ApiCallHandler<RemoveLabelFromNoteInput, RemoveLabelFromNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: RemoveLabelFromNoteInput): Promise<RemoveLabelFromNoteOutput> => {
        return this.handler.handle(input);
    };
}
