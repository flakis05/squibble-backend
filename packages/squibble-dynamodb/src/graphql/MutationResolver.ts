import { Resolver } from '../apollo/Resolver';
import { MutationCall } from './MutationCall';

export class MutationResolver<InputType, OutputType> implements Resolver<OutputType> {
    private mutationCall: MutationCall<InputType, OutputType>;
    constructor(mutationCall: MutationCall<InputType, OutputType>) {
        this.mutationCall = mutationCall;
    }

    public resolve = (_: any, args: any): Promise<OutputType> => {
        return this.mutationCall.mutate(args.input);
    };
}
