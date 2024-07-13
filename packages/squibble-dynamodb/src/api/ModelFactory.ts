export interface ModelFactory<Input, Output> {
    fromInput(item: Input): Output;
}
