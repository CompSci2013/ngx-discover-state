# @halolabs/ngx-discover-state

URL-first state management engine for the ngx-discover library suite.

## What This Library Provides

The state management layer that implements the core data pipeline: URL change -> filter parsing -> API fetch -> component state. Every filter, sort, page, and highlight parameter lives in the URL — users can bookmark, share, and navigate back through filter states.

### Key Exports

| Export | Purpose |
|--------|---------|
| `ResourceManagementService` | Core state orchestrator. Provided at **component level** (one instance per discover page). Exposes `state$`, `results$`, `filters$`, `statistics$`, `loading$`, `error$` observables. |
| `UrlStateService` | Bidirectional URL-to-state sync. Components call `setParams()` to write filters to the URL. |
| `ApiService` | Thin HTTP wrapper over `HttpClient` with query parameter serialization and error handling. |
| `RequestCoordinatorService` | Three-layer optimization: cache (keyed by `ICacheKeyBuilder`), deduplication (identical in-flight requests share one observable), and retry. |
| `FilterOptionsService` | Caches filter dropdown options. In pop-out windows, receives cached options via state broadcast instead of making API calls. |
| `IS_POPOUT_TOKEN` | DI token — `true` when running inside a pop-out window. |

### Re-exported from `@halolabs/ngx-discover-config`

For backward compatibility, this library re-exports:
`IFilterUrlMapper`, `IApiAdapter`, `ICacheKeyBuilder`, `ApiAdapterResponse`, `ResourceManagementConfig`, `ResourceState`, `ApiResponse`, `IApiService`, `ApiRequestOptions`

## Installation

### From GitLab npm Registry

Add to your project's `.npmrc`:

```
@halolabs:registry=http://gitlab.minilab/api/v4/groups/7/-/packages/npm/
//gitlab.minilab/api/v4/groups/7/-/packages/npm/:_authToken=YOUR_TOKEN
```

Then install:

```bash
npm install @halolabs/ngx-discover-state
```

### Peer Dependencies

| Dependency | Version |
|------------|---------|
| `@angular/common` | `^14.0.0` |
| `@angular/core` | `^14.0.0` |
| `@angular/router` | `^14.0.0` |
| `@halolabs/ngx-discover-config` | `^1.0.0` |
| `rxjs` | `^7.0.0` |

## Usage

### In Your Feature Component

```typescript
import { ResourceManagementService, UrlStateService } from '@halolabs/ngx-discover-state';
import { DOMAIN_CONFIG, DomainConfig } from '@halolabs/ngx-discover-config';

@Component({
  selector: 'app-discover',
  providers: [ResourceManagementService]  // Component-level — one per page
})
export class DiscoverComponent implements OnInit {
  constructor(
    @Inject(DOMAIN_CONFIG) public config: DomainConfig<any, any, any>,
    public resourceService: ResourceManagementService,
    private urlState: UrlStateService
  ) {}

  ngOnInit() {
    // ResourceManagementService auto-subscribes to URL changes
    // and fetches data via the DomainConfig's apiAdapter
  }
}
```

### Data Flow

```
URL change -> UrlStateService.params$
  -> ResourceManagementService.fromUrlParams()
    -> RequestCoordinatorService.fetch()
      -> IApiAdapter.fetchData()
        -> API response
      -> Cache result
    -> Update ResourceState
      -> state$ / results$ / statistics$ emit
        -> Components re-render (OnPush)
```

## Architecture

```
@halolabs/ngx-discover-config  (leaf)
         ^
@halolabs/ngx-discover-state   <-- you are here
         ^
@halolabs/ngx-discover-framework (depends on state)
```

This library is pure TypeScript — no `NgModule`. Services are `@Injectable()` and provided via component-level providers or `providedIn: 'root'`.

## Building

```bash
npm install
npm run build   # ng build state --configuration production
```

Output goes to `dist/ngx-discover-state/`.
