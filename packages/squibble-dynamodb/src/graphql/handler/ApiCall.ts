export type ApiCall<I, O> = (input: I) => Promise<O>;
