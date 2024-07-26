export type ID = string;

export type Entity<K extends string = 'id'> = {
    [P in K]: ID;
};

export interface CreatedAt {
    createdAt: string;
}

export interface AddedAt {
    addedAt: string;
}

export interface DeletedAt {
    deletedAt?: string;
}

export interface CreatedModifiedAt {
    createdAt: string;
    modifiedAt: string;
}

export type Errorable<T> = T | Error;

export type WithDateNow<T> = T & {
    dateNow: string;
};

export type Never<T> = {
    [P in keyof T]?: never;
};
