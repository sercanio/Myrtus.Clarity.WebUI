// src/modules/cms/store/services/cmsApi.ts

import { api as baseApi, ApiType } from '@store/api';
// Import your types or define them here
// e.g., Content, ContentDto, etc.

export interface ContentDto {
  contentType: string;
  title: string;
  slug: string;
  body: string;
  tags: string[];
  status: string;
  language: string;
  coverImageUrl?: string; // Added coverImageUrl
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
}

export interface Content extends ContentDto {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  versions: Version[];
}

export interface Version {
  versionNumber: number;
  title: string;
  body: string;
  modifiedAt: string;
  modifiedBy: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Media {
  id: string;
  fileName: string;
  blobUri: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface UploadMediaRequest {
  file: File;
}

export interface DynamicSort {
  field: string;
  dir: 'asc' | 'desc';
}

export interface DynamicFilter {
  field: string;
  operator: string;       // e.g. 'contains', 'eq', 'startsWith', etc.
  value: string;          // user-provided value
  logic: string;          // 'string', 'number', 'date', etc.
  isCaseSensitive: boolean;
}

export interface DynamicQueryRequest {
  sort?: DynamicSort[];
  filter?: DynamicFilter | null;
}

export interface DynamicMediaQueryArgs {
  pageIndex: number;
  pageSize: number;
  requestBody: DynamicQueryRequest;
}

export interface DynamicContentQueryArgs {
  pageIndex: number;
  pageSize: number;
  requestBody: DynamicQueryRequest;
}

// Keep track of whether we’ve injected endpoints before
let endpointsInjected = false;

/**
 * The extended “slice” returned by `api.injectEndpoints(...)`.
 * We'll store it in a variable after injection.
 */
let extendedApi: ApiType | null = null;
/**
 * Dynamically inject CMS endpoints into the baseApi.
 * Only called once to avoid duplicate injection errors.
 */
export function addCmsEndpoints() {
  if (!endpointsInjected) {
    endpointsInjected = true;

    extendedApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
        getContentById: builder.query<Content, string>({
          query: (id) => `content/${id}`,
          providesTags: (): [{ type: 'Contents' }] => [{ type: 'Contents' }],
        }),

        getAllContents: builder.query<PaginatedResponse<Content>, { pageIndex: number; pageSize: number }>({
          query: ({ pageIndex, pageSize }) => ({
            url: 'content',
            params: { pageIndex, pageSize },
          }),
          providesTags: ['Contents'],
        }),

        getAllContentsDynamic: builder.query<PaginatedResponse<Content>, DynamicContentQueryArgs>({
          query: ({ pageIndex, pageSize, requestBody }) => ({
            url: `content/dynamic?pageIndex=${pageIndex}&pageSize=${pageSize}`,
            method: 'POST',
            body: requestBody,
          }),
          providesTags: ['Contents'],
        }),

        createContent: builder.mutation<Content, ContentDto>({
          query: (content) => ({
            url: 'content',
            method: 'POST',
            body: content,
          }),
          invalidatesTags: (): [{ type: 'Contents' }] => [{ type: 'Contents' }],
        }),

        updateContent: builder.mutation<void, { id: string; content: ContentDto }>({
          query: ({ id, content }) => ({
            url: `content/${id}`,
            method: 'PUT',
            body: content,
          }),
          invalidatesTags: (): [{ type: 'Contents' }] => [{ type: 'Contents' }],
        }),

        deleteContent: builder.mutation<void, string>({
          query: (id) => ({
            url: `content/${id}`,
            method: 'DELETE',
          }),
          invalidatesTags: (): [{ type: 'Contents' }] => [{ type: 'Contents' }],
        }),

        restoreContentVersion: builder.mutation<void, { id: string; versionNumber: number }>({
          query: ({ id, versionNumber }) => ({
            url: `content/${id}/restore/${versionNumber}`,
            method: 'POST',
          }),
          invalidatesTags: ['Contents'],
        }),

        checkSlug: builder.mutation<{ exists: boolean }, { slug: string }>({
          query: (slug) => ({
            url: `content/slug/exists/${slug}`,
            method: 'GET',
          }),
          invalidatesTags: ['Contents'],
        }),

        getAllMedia: builder.query<PaginatedResponse<Media>, { pageIndex: number; pageSize: number }>({
          query: ({ pageIndex, pageSize }) => ({
            url: 'media',
            params: { pageIndex, pageSize },
          }),
          providesTags: ['Media'],
        }),

        getAllMediaDynamic: builder.query<PaginatedResponse<Media>, DynamicMediaQueryArgs>({
          query: ({ pageIndex, pageSize, requestBody }) => ({
            url: `media/dynamic?pageIndex=${pageIndex}&pageSize=${pageSize}`,
            method: 'POST',
            body: requestBody,
          }),
          providesTags: ['Media'],
        }),

        uploadMedia: builder.mutation<string, FormData>({
          query: (formData) => ({
            url: 'media/upload',
            method: 'POST',
            body: formData,
          }),
          invalidatesTags: ['Media'],
        }),

        deleteMedia: builder.mutation<void, string>({
          query: (id) => ({
            url: `media/${id}`,
            method: 'DELETE',
          }),
          invalidatesTags: ['Media'],
        }),
      }),
      overrideExisting: false,
    });
  }

  return extendedApi;
}

/**
 * A helper to retrieve typed hooks after injection.
 * If `addCmsEndpoints()` hasn't been called, this will throw an error.
 */
export function getCmsHooks() {
  if (!extendedApi) {
    throw new Error(
      'CMS endpoints have not been injected yet. ' + 
      'Make sure to call addCmsEndpoints() before using getCmsHooks()'
    );
  }
  // Return whichever hooks you want to consume in components
  return {
    useGetContentByIdQuery: extendedApi.useGetContentByIdQuery,
    useGetAllContentsQuery: extendedApi.useGetAllContentsQuery,
    useGetAllContentsDynamicQuery: extendedApi.useGetAllContentsDynamicQuery,
    useCreateContentMutation: extendedApi.useCreateContentMutation, 
    useUpdateContentMutation: extendedApi.useUpdateContentMutation,
    useDeleteContentMutation: extendedApi.useDeleteContentMutation,
    useRestoreContentVersionMutation: extendedApi.useRestoreContentVersionMutation,
    useCheckSlugMutation: extendedApi.useCheckSlugMutation,
    useGetAllMediaQuery: extendedApi.useGetAllMediaQuery,
    useGetAllMediaDynamicQuery: extendedApi.useGetAllMediaDynamicQuery,
    useUploadMediaMutation: extendedApi.useUploadMediaMutation,
    useDeleteMediaMutation: extendedApi.useDeleteMediaMutation,
  };
}
