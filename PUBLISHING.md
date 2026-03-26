# Publishing to GitLab npm Registry

This document covers how to publish @halolabs/ngx-discover-* packages to the GitLab npm registry at `gitlab.minilab`, and how consuming projects install them.

## Prerequisites

- A GitLab Personal Access Token (PAT) with `api` scope
- The library built successfully (`npm run build`)

## Publisher Setup

### 1. Create `.npmrc` in the library's project directory

Each library needs a `.npmrc` file in its `projects/<lib>/` directory:

```
@halolabs:registry=http://gitlab.minilab/api/v4/projects/PROJECT_ID/packages/npm/
//gitlab.minilab/api/v4/projects/PROJECT_ID/packages/npm/:_authToken=YOUR_PAT_TOKEN
```

**Project IDs:**

| Library | Project ID | Registry URL |
|---------|-----------|--------------|
| ngx-discover-config | 104 | `http://gitlab.minilab/api/v4/projects/104/packages/npm/` |
| ngx-discover-state | 105 | `http://gitlab.minilab/api/v4/projects/105/packages/npm/` |
| ngx-discover-framework | 106 | `http://gitlab.minilab/api/v4/projects/106/packages/npm/` |
| ngx-popout | (check GitLab) | project-level URL |

### 2. Add `.npmrc` to `.gitignore`

The `.npmrc` contains your auth token. It is already gitignored in these repos.

### 3. Build and Publish

```bash
# Build
npm run build

# Copy .npmrc to dist (required — npm publish reads from cwd)
cp projects/<lib>/.npmrc dist/ngx-discover-<lib>/

# Publish
cd dist/ngx-discover-<lib>
npm publish
```

### Publish Order (dependencies matter)

Libraries must be published in dependency order:

```
1. @halolabs/ngx-discover-config   (no library dependencies)
2. @halolabs/ngx-popout             (no library dependencies)
3. @halolabs/ngx-discover-state     (depends on config)
4. @halolabs/ngx-discover-framework (depends on config + state + popout)
```

### Version Bumping

Before publishing a new version, update the version in `projects/<lib>/package.json`:

```bash
# In the project directory (not dist)
cd projects/config
npm version patch   # 1.0.0 -> 1.0.1
# or
npm version minor   # 1.0.0 -> 1.1.0
```

Then rebuild and publish.

## Consumer Setup

### 1. Create `.npmrc` in your consuming project root

```
@halolabs:registry=http://gitlab.minilab/api/v4/groups/7/-/packages/npm/
//gitlab.minilab/api/v4/groups/7/-/packages/npm/:_authToken=YOUR_PAT_TOKEN
```

This uses the **group-level** registry (group ID 7 = `halo`), which serves all `@halolabs/*` packages from any project in the group.

### 2. Install packages

```bash
npm install @halolabs/ngx-discover-config @halolabs/ngx-discover-state @halolabs/ngx-discover-framework @halolabs/ngx-popout
```

### 3. Verify installation

```bash
npm ls @halolabs/ngx-discover-config
npm ls @halolabs/ngx-discover-state
npm ls @halolabs/ngx-discover-framework
npm ls @halolabs/ngx-popout
```

## Full Publish Script

Run from each library workspace root:

```bash
#!/bin/bash
set -e

LIB_NAME=$1  # e.g., "config", "state", "framework"
DIST_NAME="ngx-discover-$LIB_NAME"

echo "Building $DIST_NAME..."
npm run build

echo "Copying .npmrc to dist..."
cp "projects/$LIB_NAME/.npmrc" "dist/$DIST_NAME/"

echo "Publishing..."
cd "dist/$DIST_NAME"
npm publish

echo "Published $(node -p "require('./package.json').name")@$(node -p "require('./package.json').version")"
```

## Verifying on GitLab

After publishing, the package appears at:
- **Project level**: `http://gitlab.minilab/halo/ngx-discover-<lib>/-/packages`
- **Group level**: `http://gitlab.minilab/groups/halo/-/packages`

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `403 Forbidden` | Invalid or expired PAT | Generate new token with `api` scope |
| `409 Conflict` | Version already exists | Bump version before publishing |
| `404 Not Found` on install | Consumer `.npmrc` missing or wrong group ID | Ensure group-level registry URL with group ID 7 |
| Package installs but types missing | Built without `--configuration production` | Always use `npm run build` (uses production config) |
