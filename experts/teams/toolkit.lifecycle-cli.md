# toolkit.lifecycle-cli

## purpose

M365 Agents Toolkit lifecycle configuration (`m365agents.yml`) and full `teamsapp` CLI command reference for provisioning, deploying, and managing Teams agents.

## rules

1. **m365agents.yml is the lifecycle manifest.** Every Agents Toolkit project has an `m365agents.yml` at the project root. It defines the `provision`, `deploy`, and `publish` lifecycle stages — each stage is an ordered list of actions.
2. **Lifecycle stages run in order: provision → deploy → publish.** Provision creates cloud resources (Azure Bot, App Registration, resource groups). Deploy pushes app code to compute targets. Publish submits the app package to the Teams catalog.
3. **Actions use `uses:` for built-ins, `runs:` for custom scripts.** Built-in actions like `arm/deploy` or `teamsApp/create` are referenced with `uses: <action-name>`. Custom shell commands use `runs: <command>`. Both accept a `with:` block for parameters.
4. **Built-in actions cover the full lifecycle.** Key actions: `aadApp/create`, `aadApp/update`, `botAadApp/create`, `botFramework/create`, `arm/deploy`, `azureAppService/deploy`, `azureFunctions/deploy`, `teamsApp/create`, `teamsApp/update`, `teamsApp/validateManifest`, `teamsApp/zipAppPackage`.
5. **`environmentFolderPath`** in `m365agents.yml` points to the `env/` directory. Defaults to `./env`. All `${{VAR}}` placeholders resolve from the active environment's `.env.{name}` files.
6. **`teamsapp new` scaffolds a project.** Creates project structure with `m365agents.yml`, `env/` folder, `appPackage/`, and starter code. Supports `--template` for predefined templates and `--interactive false` for CI.
7. **`teamsapp provision` creates cloud resources.** Runs the `provision` stage in `m365agents.yml`. Accepts `--env <name>` to target a specific environment (default: `dev`). Creates resources defined by ARM templates or built-in actions.
8. **`teamsapp deploy` pushes code to cloud.** Runs the `deploy` stage. Builds the project, then deploys to the compute target (App Service, Functions, Container Apps). Always run `teamsapp provision` before first deploy.
9. **`teamsapp publish` submits to the org catalog.** Runs the `publish` stage. Packages the app and submits it to the Teams Admin Center for org-wide distribution. Requires admin approval after submission.
10. **`teamsapp validate` checks the manifest.** Validates `manifest.json` against the Teams schema before packaging. Catches missing fields, invalid scopes, and schema violations early.
11. **`teamsapp package` creates the app zip bundle.** Generates the `.zip` containing `manifest.json`, icons, and resolved placeholders. This is the artifact uploaded to Teams or Partner Center.
12. **`teamsapp preview` launches local testing.** Starts the Agents Playground for local testing without deploying to Teams. See `toolkit.playground-ts.md` for details.
13. **CI/CD integration uses `teamsapp` CLI with `--env` flags.** GitHub Actions and Azure Pipelines call `teamsapp provision --env staging` and `teamsapp deploy --env staging` in sequence. Store credentials in CI secrets, not in `.env.*.user` files.

## patterns

### Pattern 1: m365agents.yml anatomy

```yaml
# m365agents.yml — lifecycle configuration
version: v1.7

environmentFolderPath: ./env

provision:
  - uses: aadApp/create
    with:
      name: ${{AAD_APP_NAME}}
      generateClientSecret: true
      signInAudience: AzureADMultipleOrgs
    writeToEnvironmentFile:
      clientId: AAD_APP_CLIENT_ID
      clientSecret: SECRET_AAD_APP_CLIENT_SECRET
      objectId: AAD_APP_OBJECT_ID
      tenantId: AAD_APP_TENANT_ID

  - uses: botAadApp/create
    with:
      name: ${{BOT_DISPLAY_NAME}}
    writeToEnvironmentFile:
      botId: BOT_ID
      botPassword: SECRET_BOT_PASSWORD

  - uses: arm/deploy
    with:
      subscriptionId: ${{AZURE_SUBSCRIPTION_ID}}
      resourceGroupName: ${{AZURE_RESOURCE_GROUP_NAME}}
      templates:
        - path: ./infra/azure.bicep
          parameters: ./infra/azure.parameters.json
          deploymentName: teams-bot
    writeToEnvironmentFile:
      botEndpoint: BOT_ENDPOINT

  - uses: teamsApp/create
    with:
      name: ${{TEAMS_APP_NAME}}
    writeToEnvironmentFile:
      teamsAppId: TEAMS_APP_ID

deploy:
  - uses: azureAppService/deploy
    with:
      artifactFolder: .
      resourceId: ${{AZURE_APP_SERVICE_RESOURCE_ID}}

publish:
  - uses: teamsApp/validateManifest
    with:
      manifestPath: ./appPackage/manifest.json

  - uses: teamsApp/zipAppPackage
    with:
      manifestPath: ./appPackage/manifest.json
      outputZipPath: ./appPackage/build/appPackage.${{TEAMSFX_ENV}}.zip
      outputFolder: ./appPackage/build

  - uses: teamsApp/update
    with:
      appPackagePath: ./appPackage/build/appPackage.${{TEAMSFX_ENV}}.zip
```

### Pattern 2: CLI command reference

```bash
# Scaffold a new project
teamsapp new                                    # Interactive wizard
teamsapp new --template ai-bot --interactive false  # Non-interactive

# Provision cloud resources
teamsapp provision                              # Uses default env (dev)
teamsapp provision --env staging                # Target specific env

# Deploy application code
teamsapp deploy                                 # Deploy to default env
teamsapp deploy --env production                # Deploy to production

# Validate and package
teamsapp validate --manifest-path ./appPackage/manifest.json
teamsapp package --manifest-path ./appPackage/manifest.json \
  --output-zip-path ./build/appPackage.zip

# Publish to org catalog
teamsapp publish

# Local preview / Agents Playground
teamsapp preview

# Update an existing Teams app registration
teamsapp update
```

### Pattern 3: GitHub Actions CI/CD pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy Teams Bot
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Install Agents Toolkit CLI
        run: npm install -g @microsoft/teamsapp-cli

      - name: Provision
        run: teamsapp provision --env production
        env:
          AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
          AZURE_RESOURCE_GROUP_NAME: ${{ secrets.AZURE_RESOURCE_GROUP_NAME }}
          # M365 credentials for app registration
          M365_ACCOUNT_NAME: ${{ secrets.M365_ACCOUNT_NAME }}
          M365_ACCOUNT_PASSWORD: ${{ secrets.M365_ACCOUNT_PASSWORD }}

      - name: Deploy
        run: teamsapp deploy --env production
        env:
          AZURE_SUBSCRIPTION_ID: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

### Pattern 4: Cross-Platform Projects (no m365agents.yml)

Standalone cross-platform examples (Teams + Slack) can skip `m365agents.yml` entirely. These projects:

- Use a single `.env` file at the project root (loaded via `dotenv`) instead of `env/.env.{name}` pairs
- Still include `appPackage/manifest.json` for sideloading into Teams
- Run with `tsx watch` or `node` directly — no `teamsapp provision` or `teamsapp deploy` needed
- Manage Azure resources manually (Bot Registration, App Service) rather than through lifecycle actions

```
cross-platform-bot/
├── appPackage/
│   └── manifest.json          # v1.20 schema, ${{VAR}} placeholders for sideloading
├── src/
│   ├── adapters/
│   │   ├── teams-bot.ts       # @microsoft/teams.apps handler
│   │   └── slack-bot.ts       # @slack/bolt handler
│   └── index.ts               # Starts both platforms
├── .env                       # All credentials (Teams + Slack) in one file
├── package.json
└── tsconfig.json              # extends @microsoft/teams.config/tsconfig.node.json
```

> **When to add `m365agents.yml`:** Only when you want `teamsapp provision` / `teamsapp deploy` to manage Azure resources automatically. For teaching examples and local development, manual `.env` + sideloading is simpler.

## pitfalls

- **Running `deploy` before `provision`** — Cloud resources must exist first. Always provision before the first deploy. Subsequent deploys can skip provision if resources haven't changed.
- **Forgetting `writeToEnvironmentFile`** — Built-in actions that create resources output IDs and secrets. Without `writeToEnvironmentFile`, downstream actions can't reference these values.
- **Editing `m365agents.yml` action order** — Actions run top-to-bottom within a stage. Moving `arm/deploy` before `botAadApp/create` breaks because the ARM template references the bot ID.
- **Using `runs:` for what `uses:` handles** — Built-in actions handle auth, retries, and environment writes automatically. Only use `runs:` for truly custom steps.
- **Committing `.env.*.user` files** — These contain secrets (`SECRET_*` vars). They're gitignored by default — don't override this.
- **Missing `--env` in CI** — Without `--env`, the CLI uses the `dev` environment. Production pipelines must specify `--env production` explicitly.
- **Confusing `teamsapp` with `teamsfx`** — The old CLI was `teamsfx`. The current CLI is `teamsapp`. If docs reference `teamsfx`, translate to `teamsapp`.
- **ARM template parameter mismatches** — `arm/deploy` parameters must match the Bicep/ARM template's expected inputs. Mismatches cause silent failures during provisioning.

## references

- [M365 Agents Toolkit overview](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/teams-toolkit-fundamentals)
- [m365agents.yml schema](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/m365-agents-yml-file)
- [Provision cloud resources](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/provision)
- [Deploy to Azure](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/deploy)
- [CI/CD with Agents Toolkit](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/toolkit-v4/use-cicd-template-v4)
- [teamsapp CLI reference](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/toolkit-cli)

## instructions

Do a web search for:

- "Microsoft 365 Agents Toolkit m365agents.yml lifecycle configuration 2025"
- "teamsapp CLI provision deploy publish commands reference"
- "Agents Toolkit CI/CD GitHub Actions Azure Pipelines"

Pair with:
- `project.scaffold-files-ts.md` — project scaffolding (what `teamsapp new` creates)
- `../deploy/azure-bot-deploy-ts.md` — manual Azure deployment as alternative to Agents Toolkit
- `toolkit.environments.md` — environment files consumed by lifecycle hooks
- `toolkit.publish.md` — detailed publishing workflow

## research

Deep Research prompt:

"Write a micro expert on Microsoft 365 Agents Toolkit lifecycle management (TypeScript). Cover m365agents.yml anatomy, teamsapp CLI commands (new, provision, deploy, publish, validate, package, preview, update), built-in actions (arm/deploy, azureAppService/deploy, aadApp/create, botAadApp/create, teamsApp/create, teamsApp/validateManifest, teamsApp/zipAppPackage), uses: vs runs: hooks, writeToEnvironmentFile, CI/CD integration with GitHub Actions and Azure Pipelines. Include canonical patterns for: complete m365agents.yml config, CLI command reference cheat sheet, GitHub Actions deployment pipeline."
