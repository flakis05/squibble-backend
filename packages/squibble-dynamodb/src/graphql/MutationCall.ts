export interface MutationCall<InputType, OutputType> {
    mutate(input: InputType): Promise<OutputType>;
}