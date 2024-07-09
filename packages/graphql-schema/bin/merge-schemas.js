#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { print } = require('graphql');

const DIR_OUTPUT = 'generated/schema';

const appsyncGraphqlPath = path.dirname(require.resolve('appsync-graphql/package.json'));
const squibbleGraphqlPath = path.dirname(require.resolve('squibble-graphql/package.json'));

const loadedFiles = loadFilesSync([
    path.join(appsyncGraphqlPath, '**/*.graphql'),
    path.join(squibbleGraphqlPath, '**/*.graphql')
]);
const typeDefs = mergeTypeDefs(loadedFiles);
const printedTypeDefs = print(typeDefs);

if (!fs.existsSync(DIR_OUTPUT)) {
    fs.mkdirSync(DIR_OUTPUT, { recursive: true });
}
fs.writeFileSync(`${DIR_OUTPUT}/merged.graphql`, printedTypeDefs);
