import { Resolver } from '../../../apollo/Resolver';
import { GetNotesOutput, GetDeletedNotesInput } from '../../api/note/model';
import { ApiCallHandler } from '../../handler/ApiCallHandler';

export class GetDeletedNotesResolver implements Resolver<GetNotesOutput> {
    private handler: ApiCallHandler<GetDeletedNotesInput, GetNotesOutput>;

    constructor(handler: ApiCallHandler<GetDeletedNotesInput, GetNotesOutput>) {
        this.handler = handler;
    }

    public resolve = async (_: any, args: any): Promise<GetNotesOutput> => {
        const input: GetDeletedNotesInput = {
            noteId: args.noteId,
            limit: args.first,
            after: args.after,
            sort: args.sort
        };
        return await this.handler.handle(input);
    };
}
