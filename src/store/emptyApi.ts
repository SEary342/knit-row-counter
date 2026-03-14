import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// This is the base for generated endpoints from the backend OpenAPI schema.
export const emptySplitApi = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: () => ({}),
})
