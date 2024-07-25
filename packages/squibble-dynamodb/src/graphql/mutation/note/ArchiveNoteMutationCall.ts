import { ArchiveNoteInput, ArchiveNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';
import { MutationCall } from '../MutationCall';

export class ArchiveNoteMutationCall implements MutationCall<ArchiveNoteInput, ArchiveNoteOutput> {
    private handler: ApiCallHandler<ArchiveNoteInput, ArchiveNoteOutput>;

    constructor(handler: ApiCallHandler<ArchiveNoteInput, ArchiveNoteOutput>) {
        this.handler = handler;
    }

    public mutate = (input: ArchiveNoteInput): Promise<ArchiveNoteOutput> => {
        return this.handler.handle(input);
    };
}
