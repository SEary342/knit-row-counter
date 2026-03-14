/**
 * @type {import('@rtk-query/codegen-openapi').ConfigFile}
 */
const config = {
  schemaFile: 'http://localhost:8000/openapi.json',
  apiFile: './src/store/emptyApi.ts',
  apiImport: 'emptySplitApi',
  outputFile: './src/store/openApi.ts',
  exportName: 'openApi',
  hooks: { queries: true, mutations: true, lazyQueries: true },
  tag: true,
}

export default config
