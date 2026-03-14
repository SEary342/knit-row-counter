import { emptySplitApi as api } from "./emptyApi";
export const addTagTypes = ["projects", "progress"] as const;
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes,
  })
  .injectEndpoints({
    endpoints: (build) => ({
      updateProjectApiV1ProjectsProjectIdPatch: build.mutation<
        UpdateProjectApiV1ProjectsProjectIdPatchApiResponse,
        UpdateProjectApiV1ProjectsProjectIdPatchApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/projects/${queryArg.projectId}`,
          method: "PATCH",
          body: queryArg.projectUpdate,
        }),
        invalidatesTags: ["projects"],
      }),
      getProjectTemplateApiV1ProjectsProjectIdShareGet: build.query<
        GetProjectTemplateApiV1ProjectsProjectIdShareGetApiResponse,
        GetProjectTemplateApiV1ProjectsProjectIdShareGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/projects/${queryArg.projectId}/share`,
        }),
        providesTags: ["projects"],
      }),
      listMyProjectsApiV1ProjectsGet: build.query<
        ListMyProjectsApiV1ProjectsGetApiResponse,
        ListMyProjectsApiV1ProjectsGetApiArg
      >({
        query: () => ({ url: `/api/v1/projects/` }),
        providesTags: ["projects"],
      }),
      createProjectApiV1ProjectsPost: build.mutation<
        CreateProjectApiV1ProjectsPostApiResponse,
        CreateProjectApiV1ProjectsPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/projects/`,
          method: "POST",
          body: queryArg.project,
        }),
        invalidatesTags: ["projects"],
      }),
      getProjectQrApiV1ProjectsProjectIdShareQrGet: build.query<
        GetProjectQrApiV1ProjectsProjectIdShareQrGetApiResponse,
        GetProjectQrApiV1ProjectsProjectIdShareQrGetApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/projects/${queryArg.projectId}/share/qr`,
        }),
        providesTags: ["projects"],
      }),
      addProgressApiV1ProgressPost: build.mutation<
        AddProgressApiV1ProgressPostApiResponse,
        AddProgressApiV1ProgressPostApiArg
      >({
        query: (queryArg) => ({
          url: `/api/v1/progress/`,
          method: "POST",
          body: queryArg.progressRecord,
        }),
        invalidatesTags: ["progress"],
      }),
      appLoginAuthLoginGet: build.query<
        AppLoginAuthLoginGetApiResponse,
        AppLoginAuthLoginGetApiArg
      >({
        query: () => ({ url: `/auth/login` }),
        providesTags: [],
      }),
      loginCallbackAuthCallbackGet: build.query<
        LoginCallbackAuthCallbackGetApiResponse,
        LoginCallbackAuthCallbackGetApiArg
      >({
        query: (queryArg) => ({
          url: `/auth/callback`,
          params: {
            code: queryArg.code,
          },
        }),
        providesTags: [],
      }),
      appLogoutAuthLogoutGet: build.query<
        AppLogoutAuthLogoutGetApiResponse,
        AppLogoutAuthLogoutGetApiArg
      >({
        query: () => ({ url: `/auth/logout` }),
        providesTags: [],
      }),
      activeUserAuthUserGet: build.query<
        ActiveUserAuthUserGetApiResponse,
        ActiveUserAuthUserGetApiArg
      >({
        query: () => ({ url: `/auth/user` }),
        providesTags: [],
      }),
      rootGet: build.query<RootGetApiResponse, RootGetApiArg>({
        query: () => ({ url: `/` }),
        providesTags: [],
      }),
    }),
    overrideExisting: false,
  });
export { injectedRtkApi as openApi };
export type UpdateProjectApiV1ProjectsProjectIdPatchApiResponse =
  /** status 200 Successful Response */ Project;
export type UpdateProjectApiV1ProjectsProjectIdPatchApiArg = {
  projectId: string;
  projectUpdate: ProjectUpdate;
};
export type GetProjectTemplateApiV1ProjectsProjectIdShareGetApiResponse =
  /** status 200 Successful Response */ any;
export type GetProjectTemplateApiV1ProjectsProjectIdShareGetApiArg = {
  projectId: string;
};
export type ListMyProjectsApiV1ProjectsGetApiResponse =
  /** status 200 Successful Response */ Project[];
export type ListMyProjectsApiV1ProjectsGetApiArg = void;
export type CreateProjectApiV1ProjectsPostApiResponse =
  /** status 200 Successful Response */ Project;
export type CreateProjectApiV1ProjectsPostApiArg = {
  project: Project;
};
export type GetProjectQrApiV1ProjectsProjectIdShareQrGetApiResponse =
  /** status 200 Successful Response */ any;
export type GetProjectQrApiV1ProjectsProjectIdShareQrGetApiArg = {
  projectId: string;
};
export type AddProgressApiV1ProgressPostApiResponse =
  /** status 200 Successful Response */ ProgressRecord;
export type AddProgressApiV1ProgressPostApiArg = {
  progressRecord: ProgressRecord;
};
export type AppLoginAuthLoginGetApiResponse =
  /** status 200 Successful Response */ any;
export type AppLoginAuthLoginGetApiArg = void;
export type LoginCallbackAuthCallbackGetApiResponse =
  /** status 200 Successful Response */ any;
export type LoginCallbackAuthCallbackGetApiArg = {
  code: string;
};
export type AppLogoutAuthLogoutGetApiResponse =
  /** status 200 Successful Response */ any;
export type AppLogoutAuthLogoutGetApiArg = void;
export type ActiveUserAuthUserGetApiResponse =
  /** status 200 Successful Response */ User;
export type ActiveUserAuthUserGetApiArg = void;
export type RootGetApiResponse = /** status 200 Successful Response */ any;
export type RootGetApiArg = void;
export type Project = {
  name: string;
  total_rows?: number | null;
  current_row?: number;
  notes?: string;
  pattern_url?: string | null;
  id?: string;
  last_modified?: string;
  user_id: string;
};
export type ValidationError = {
  loc: (string | number)[];
  msg: string;
  type: string;
  input?: any;
  ctx?: object;
};
export type HttpValidationError = {
  detail?: ValidationError[];
};
export type ProjectUpdate = {
  name?: string | null;
  total_rows?: number | null;
  notes?: string | null;
  pattern_url?: string | null;
};
export type ProgressRecord = {
  id?: string;
  project_id: string;
  section_id: string;
  timestamp?: string;
  rows_delta: number;
  stitches_delta: number;
};
export type User = {
  id?: string;
  identity_id: string;
  email: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
};
export const {
  useUpdateProjectApiV1ProjectsProjectIdPatchMutation,
  useGetProjectTemplateApiV1ProjectsProjectIdShareGetQuery,
  useLazyGetProjectTemplateApiV1ProjectsProjectIdShareGetQuery,
  useListMyProjectsApiV1ProjectsGetQuery,
  useLazyListMyProjectsApiV1ProjectsGetQuery,
  useCreateProjectApiV1ProjectsPostMutation,
  useGetProjectQrApiV1ProjectsProjectIdShareQrGetQuery,
  useLazyGetProjectQrApiV1ProjectsProjectIdShareQrGetQuery,
  useAddProgressApiV1ProgressPostMutation,
  useAppLoginAuthLoginGetQuery,
  useLazyAppLoginAuthLoginGetQuery,
  useLoginCallbackAuthCallbackGetQuery,
  useLazyLoginCallbackAuthCallbackGetQuery,
  useAppLogoutAuthLogoutGetQuery,
  useLazyAppLogoutAuthLogoutGetQuery,
  useActiveUserAuthUserGetQuery,
  useLazyActiveUserAuthUserGetQuery,
  useRootGetQuery,
  useLazyRootGetQuery,
} = injectedRtkApi;
