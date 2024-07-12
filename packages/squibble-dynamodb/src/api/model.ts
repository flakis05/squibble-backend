export type ID = string;

export type Entity<K extends string = 'id'> = {
    [P in K]: ID;
};

export interface CreatedModifiedAt {
    createdAt: string;
    modifiedAt: string;
}

export type Errorable<T> = T | Error;