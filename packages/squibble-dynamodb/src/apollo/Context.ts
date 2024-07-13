import DataLoader from 'dataloader';

export interface Context {
    dataLoader: Record<string, DataLoader<any, any>>;
}
