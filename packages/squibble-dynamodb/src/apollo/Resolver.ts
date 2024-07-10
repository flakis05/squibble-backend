import { Context } from './Context';

export interface Resolver<OutputType> {
    resolve(parent: any, args: any, contextValue: Context, info: any): Promise<OutputType>;
}