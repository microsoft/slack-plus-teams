# toolkit.environments

## purpose

Multi-environment management with environment files, variable resolution, and the `SECRET_` prefix convention for Agents Toolkit projects.

## rules

1. **Environment files live in `env/`.** Each environment has a pair of files: `env/.env.{name}` for shared config and `env/.env.{name}.user` for personal/secret values. The `environmentFolderPath` in `m365agents.yml` points to this folder.
2. **Default environment is `dev`.** Scaffolded projects create `env/.env.dev` and `env/.env.dev.user`. Additional environments (staging, production) are created by running `teamsapp provision --env <name>`.
3. **Variable syntax is `${{VAR_NAME}}`.** Both `manifest.json` and `m365agents.yml` use `${{VAR_NAME}}` placeholders. At build/provision/deploy time, the toolkit resolves them from the active environment's `.env` files.
4. **`SECRET_` prefix marks sensitive values.** Variables prefixed with `SECRET_` (e.g., `SECRET_BOT_PASSWORD`, `SECRET_AAD_APP_CLIENT_SECRET`) are stored only in `.env.*.user` files, which are gitignored. Never put `SECRET_` values in `.env.{name}`.
5. **`.env.*.user` files are gitignored by default.** The scaffold includes a `.gitignore` entry for `env/.env.*.user`. These files contain developer-specific credentials and secrets. Never commit them.
6. **Built-in environment variables are auto-populated.** Lifecycle actions write outputs to env files via `writeToEnvironmentFile`. Common auto-populated vars: `TEAMS_APP_ID`, `BOT_ID`, `SECRET_BOT_PASSWORD`, `AAD_APP_CLIENT_ID`, `SECRET_AAD_APP_CLIENT_SECRET`, `AAD_APP_OBJECT_ID`, `AAD_APP_TENANT_ID`.
7. **Azure resource variables must be set per environment.** `AZURE_SUBSCRIPTION_ID` and `AZURE_RESOURCE_GROUP_NAME` are required for provisioning. Set them in `.env.{name}` or pass via CLI/CI environment.
8. **Custom environments mirror the dev structure.** To create a staging environment, run `teamsapp provision --env staging`. This creates `env/.env.staging` and `env/.env.staging.user` with the same variable structure as dev but pointing to separate cloud resources.
9. **VS Code sidebar switches environments.** The Agents Toolkit VS Code extension shows a dropdown in the sidebar to switch the active environment. This changes which `.env.{name}` files are used for provision, deploy, and preview commands.
10. **Manifest placeholders resolve at package time.** When `teamsapp package` or `teamsApp/zipAppPackage` runs, all `${{VAR}}` placeholders in `manifest.json` are replaced with values from the active environment. The output zip contains a fully resolved manifest.
11. **Environment-specific resource isolation.** Each environment should use separate Azure resource groups to avoid resource conflicts. Use naming conventions like `rg-mybot-dev`, `rg-mybot-staging`, `rg-mybot-prod`.

## patterns

### Pattern 1: Environment file structure

```
project-root/
├── m365agents.yml
├── env/
│   ├── .env.dev                  # Shared dev config (committed)
│   ├── .env.dev.user             # Dev secrets (gitignored)
│   ├── .env.staging              # Shared staging config (committed)
│   ├── .env.staging.user         # Staging secrets (gitignored)
│   ├── .env.production           # Shared production config (committed)
│   └── .env.production.user      # Production secrets (gitignored)
└── appPackage/
    └── manifest.json             # Uses ${{VAR}} placeholders
```

```ini
# env/.env.dev — shared config (safe to commit)
TEAMSFX_ENV=dev
TEAMS_APP_NAME=MyBot-Dev
TEAMS_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
BOT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
BOT_DOMAIN=mybot-dev.azurewebsites.net
BOT_ENDPOINT=https://mybot-dev.azurewebsites.net/api/messages
AZURE_SUBSCRIPTION_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_RESOURCE_GROUP_NAME=rg-mybot-dev
AAD_APP_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AAD_APP_OBJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AAD_APP_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

```ini
# env/.env.dev.user — secrets (gitignored)
SECRET_BOT_PASSWORD=your-bot-password-here
SECRET_AAD_APP_CLIENT_SECRET=your-client-secret-here
```

### Pattern 2: Variable resolution in manifest.json

```jsonc
// appPackage/manifest.json — placeholders resolve from active env
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.20/MicrosoftTeams.schema.json",
  "manifestVersion": "1.20",
  "version": "1.0.0",
  "id": "${{TEAMS_APP_ID}}",
  "name": {
    "short": "${{TEAMS_APP_NAME}}",
    "full": "${{TEAMS_APP_NAME}} - Full"
  },
  "bots": [
    {
      "botId": "${{BOT_ID}}",
      "scopes": ["personal", "team", "groupChat"]
    }
  ],
  "validDomains": [
    "${{BOT_DOMAIN}}"
  ]
}
```

### Pattern 3: Creating and provisioning a new environment

```bash
# Step 1: Provision creates the env files and cloud resources
teamsapp provision --env staging

# This creates:
#   env/.env.staging          (with TEAMSFX_ENV=staging, resource IDs)
#   env/.env.staging.user     (with SECRET_* values)

# Step 2: Set environment-specific overrides
# Edit env/.env.staging to adjust resource names, domains, etc.

# Step 3: Deploy to the new environment
teamsapp deploy --env staging

# Step 4: Preview/test against a specific environment
teamsapp preview --env staging
```

## pitfalls

- **Committing `.env.*.user` files** — These contain `SECRET_*` values. Verify `.gitignore` includes `env/.env.*.user` before any commit.
- **Putting secrets in `.env.{name}` instead of `.env.{name}.user`** — Non-user env files are committed. Always use the `SECRET_` prefix and store in `.user` files.
- **Forgetting to set `AZURE_SUBSCRIPTION_ID` for new environments** — Provisioning fails silently or targets the wrong subscription without this variable.
- **Reusing resource groups across environments** — Dev and staging sharing a resource group causes resource name conflicts and accidental overwrites during provisioning.
- **Stale env files after re-provisioning** — If you delete cloud resources and re-provision, old IDs in env files may not update. Delete the env files and re-provision from scratch.
- **`${{VAR}}` vs `${VAR}` confusion** — Agents Toolkit uses double-brace `${{VAR}}`. Shell-style `${VAR}` is not recognized and will not resolve.
- **Missing variables at package time** — If a `${{VAR}}` in manifest.json has no matching env entry, packaging fails. Run `teamsapp validate` first to catch these.
- **CI/CD without `.user` files** — In CI, secrets come from pipeline secrets, not `.user` files. Set `SECRET_*` vars as environment variables in the CI runner.

## references

- [Manage environments in Agents Toolkit](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/toolkit-v4/teamsfx-multi-env-v4)
- [m365agents.yml environmentFolderPath](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/m365-agents-yml-file)
- [Provision cloud resources](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/provision)
- [Teams app manifest placeholders](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/toolkit-v4/teamsfx-preview-and-customize-app-manifest-v4)

## instructions

Do a web search for:

- "Microsoft 365 Agents Toolkit multi-environment env files configuration 2025"
- "teamsapp provision --env staging multiple environments"
- "Teams Toolkit SECRET_ prefix environment variables"

Pair with:
- `toolkit.lifecycle-cli.md` — lifecycle hooks that consume environment variables
- `runtime.manifest-ts.md` — manifest `${{VAR}}` placeholder resolution
- `project.scaffold-files-ts.md` — scaffolded project includes env/ directory
- `toolkit.publish.md` — publishing requires fully resolved environment variables

## research

Deep Research prompt:

"Write a micro expert on Microsoft 365 Agents Toolkit environment management (TypeScript). Cover env/.env.{name} and env/.env.{name}.user file pairs, ${{VAR}} variable resolution in manifest.json and m365agents.yml, SECRET_ prefix convention, built-in environment variables (TEAMS_APP_ID, BOT_ID, BOT_PASSWORD, AZURE_SUBSCRIPTION_ID), creating custom environments with teamsapp provision --env, VS Code sidebar environment switching, and CI/CD environment variable injection. Include canonical patterns for: environment file structure, manifest placeholder resolution, multi-environment setup."
