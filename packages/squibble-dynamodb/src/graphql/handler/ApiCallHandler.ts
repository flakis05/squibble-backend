import { ApiCall } from './ApiCall';

export interface ApiCallHandler<I, O> {
    handle: ApiCall<I, O>;
}