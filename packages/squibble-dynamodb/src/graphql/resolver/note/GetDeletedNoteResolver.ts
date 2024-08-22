import { Resolver } from '../../../apollo/Resolver';
import { NoteEntity, GetNoteInput, GetNoteOutput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';

export class GetDeletedNoteResolver implements Resolver<NoteEntity> {
    private handler: ApiCallHandler<GetNoteInput, GetNoteOutput>;

    constructor(handler: ApiCallHandler<GetNoteInput, GetNoteOutput>) {
        this.handler = handler;
    }

    public resolve = async (_: any, args: any): Promise<NoteEntity> => {
        const input: GetNoteInput = {
            noteId: args.noteId,
            status: 'deleted'
        };
        const output: GetNoteOutput = await this.handler.handle(input);
        return output.note;
    };
}
