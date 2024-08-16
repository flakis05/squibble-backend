import DataLoader from 'dataloader';
import { Context } from '../../apollo/Context';

export enum SquibbleDataLoader {
    GET_LABEL = 'GetLabel'
}

export const getApolloContext = (dataLoader: Record<SquibbleDataLoader, DataLoader<any, any>>): Context => {
    return {
        dataLoader
    };
};
