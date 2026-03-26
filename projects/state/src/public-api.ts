// Re-export adapter interfaces from config for backward compatibility
// (these lived in state-management originally but now canonical home is config)
export {
  IFilterUrlMapper,
  IApiAdapter,
  ICacheKeyBuilder,
  ApiAdapterResponse,
  ResourceManagementConfig,
  ResourceState,
  ApiResponse,
  ApiErrorResponse,
  ApiSuccessResponse,
  StandardApiResponse,
  IApiService,
  ApiRequestOptions
} from '@halolabs/ngx-discover-config';

// Models
export * from './lib/models/pagination.interface';

// Services
export * from './lib/services/resource-management.service';
export * from './lib/services/url-state.service';
export * from './lib/services/api.service';
export * from './lib/services/request-coordinator.service';
export * from './lib/services/filter-options.service';

// Tokens
export * from './lib/tokens/popout.token';
