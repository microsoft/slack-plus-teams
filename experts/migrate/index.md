# migrate-router

## purpose

Route migration/conversion tasks to the minimal set of micro-expert files. Read only the clusters that match the user's request.

## task clusters

### Block Kit → Adaptive Cards
When: converting Block Kit JSON to Adaptive Card JSON, mapping Slack blocks to card elements
Read:
- `block-kit-to-adaptive-cards-ts.md`
Cross-domain deps: `../slack/ui.block-kit-ts.md` (source Block Kit patterns), `../teams/ui.adaptive-cards-ts.md` (target Adaptive Card patterns)

### Slack Commands → Teams
When: porting slash commands from Slack to Teams, command registration differences
Read:
- `slack-commands-to-teams-ts.md`
Cross-domain deps: `../slack/runtime.slash-commands-ts.md` (source command patterns), `../teams/runtime.routing-handlers-ts.md` (target app.message() patterns)

### Slack Events → Teams Activities
When: mapping Slack events to Teams activity handlers, event model differences
Read:
- `slack-events-to-teams-activities-ts.md`
Cross-domain deps: `../slack/runtime.bolt-foundations-ts.md` (source event patterns), `../teams/runtime.routing-handlers-ts.md` (target activity routes)

### Slack Identity → AAD
When: migrating Slack OAuth/identity to Azure AD/Entra ID, user mapping, SSO, OAuth implementation code (InstallationService, OAuthStateService, token refresh)
Read:
- `slack-identity-to-aad-ts.md`
Cross-domain deps: `../teams/auth.oauth-sso-ts.md` (target OAuth/SSO flow), `../teams/graph.usergraph-appgraph-ts.md` (Graph API for user lookup)

### Slack Middleware → Teams Handlers
When: converting Slack Bolt middleware chains to Teams handler patterns, porting global/listener middleware, removing ack()
Read:
- `slack-middleware-to-teams-ts.md`
Cross-domain deps: `../slack/runtime.bolt-foundations-ts.md` (source middleware patterns), `../teams/runtime.routing-handlers-ts.md` (target handler patterns)

### Slack Modals → Teams Dialogs
When: migrating Slack modals (views.open, viewSubmission, viewsUpdate, viewClosed, blockSuggestion in modals) to Teams task module / dialog flows
Read:
- `slack-modals-to-teams-dialogs-ts.md`
Cross-domain deps: `../teams/ui.dialogs-task-modules-ts.md` (target dialog patterns), `block-kit-to-adaptive-cards-ts.md` (converting modal Block Kit to Adaptive Cards)

### Slack App Home → Teams
When: migrating Slack App Home tab (AppHomeOpenedEvent, views.publish) to Teams personal tab or bot welcome card
Read:
- `slack-app-home-to-teams-ts.md`
Cross-domain deps: `slack-events-to-teams-activities-ts.md` (event mapping), `../teams/ui.adaptive-cards-ts.md` (card construction), `../teams/runtime.proactive-messaging-ts.md` (background updates)

### Slack Legacy Attachments → Teams
When: migrating pre-Block Kit legacy Slack attachments (callback_id, color, actions, attachmentAction) to Adaptive Cards
Read:
- `slack-legacy-attachments-to-teams-ts.md`
Cross-domain deps: `../teams/ui.adaptive-cards-ts.md` (target card patterns)

### Slack Transport → Teams Transport
When: converting Slack Socket Mode, RTM, or HTTP Events API to Teams Bot Framework HTTPS, removing WebSocket code
Read:
- `slack-transport-to-teams-ts.md`
Cross-domain deps: `../teams/runtime.app-init-ts.md` (Teams app startup), `../teams/dev.debug-test-ts.md` (ngrok/Dev Tunnels setup)

### AWS → Azure: Compute
When: Lambda to Azure Functions, compute migration, serverless porting
Read:
- `aws-to-azure.compute-ts.md`
- `aws-to-azure.secrets-config-ts.md` (App Settings / env vars needed for compute config)

### AWS → Azure: Storage
When: S3 to Blob Storage, DynamoDB to Cosmos DB, storage migration
Read:
- `aws-to-azure.storage-ts.md`
Cross-domain deps: `../teams/state.storage-patterns-ts.md` (IStorage interface for bot state on Cosmos DB)

### AWS → Azure: Secrets & Config
When: AWS Secrets Manager to Azure Key Vault, SSM to App Configuration
Read:
- `aws-to-azure.secrets-config-ts.md`
Cross-domain deps: `../security/secrets-ts.md` (secrets management best practices)

### AWS → Azure: Observability
When: CloudWatch to Application Insights, X-Ray to Azure Monitor, logging migration
Read:
- `aws-to-azure.observability-ts.md`
Cross-domain deps: `../teams/dev.debug-test-ts.md` (Teams SDK logging with ConsoleLogger)

### Slack Interactive Responses → Teams
When: migrating respond({ replace_original }), respond({ delete_original }), chat.update, chat.postEphemeral, deferred responses, response_url patterns
Read:
- `slack-interactive-responses-to-teams-ts.md`
Cross-domain deps: `../teams/ui.adaptive-cards-ts.md` (card construction), `../teams/runtime.proactive-messaging-ts.md` (deferred update infrastructure)

### Slack Files → Teams
When: migrating files.upload, files.sharedPublicURL, file events, file download/upload patterns
Read:
- `slack-files-to-teams-ts.md`
Cross-domain deps: `../teams/graph.usergraph-appgraph-ts.md` (Graph API auth), `../teams/runtime.manifest-ts.md` (supportsFiles flag)

### Slack Link Unfurling → Teams
When: migrating link_shared event, chat.unfurl(), link preview cards
Read:
- `slack-unfurl-to-teams-link-preview-ts.md`
Cross-domain deps: `../teams/ui.message-extensions-ts.md` (message extension patterns), `../teams/runtime.manifest-ts.md` (messageHandlers domain config)

### Slack Shortcuts → Teams
When: migrating global shortcuts, message shortcuts to message extensions or compose extensions
Read:
- `slack-shortcuts-to-teams-ts.md`
Cross-domain deps: `../teams/ui.message-extensions-ts.md` (message extension patterns), `../teams/ui.dialogs-task-modules-ts.md` (task module details)

### Slack Scheduling → Teams
When: migrating chat.scheduleMessage, chat.deleteScheduledMessage, reminders.add, timer-based patterns
Read:
- `slack-scheduling-to-teams-ts.md`
Cross-domain deps: `../teams/runtime.proactive-messaging-ts.md` (proactive send infrastructure), `../teams/state.storage-patterns-ts.md` (persisting scheduled items)

### Slack Channel Ops → Teams
When: migrating conversations.create, conversations.archive, conversations.invite, conversations.kick, conversations.setTopic via Graph API
Read:
- `slack-channel-ops-to-teams-ts.md`
Cross-domain deps: `../teams/graph.usergraph-appgraph-ts.md` (Graph API auth), `slack-identity-to-aad-ts.md` (user ID mapping)

### Slack Workflows → Power Automate
When: migrating Slack Workflow Builder workflows, custom workflow steps (workflow_step_execute), approval workflows
Read:
- `slack-workflows-to-power-automate-ts.md`
Cross-domain deps: `../teams/ui.adaptive-cards-ts.md` (card construction for bot-driven workflows), `../teams/runtime.proactive-messaging-ts.md` (flow-triggered bot messages)

### Slack App Distribution → Teams
When: migrating Slack App Directory listing, OAuth install flow, InstallationStore, org-level installs, sideloading, app packaging
Read:
- `slack-app-distribution-to-teams-ts.md`
Cross-domain deps: `slack-identity-to-aad-ts.md` (identity model change), `../teams/runtime.manifest-ts.md` (Teams manifest creation)

### Slack Rate Limiting → Teams Resilience
When: migrating rate limiting patterns, retry logic, throttling handling, proactive broadcast resilience, circuit breaker
Read:
- `slack-rate-limiting-resilience-ts.md`
Cross-domain deps: `../teams/runtime.proactive-messaging-ts.md` (proactive send infrastructure), `../teams/graph.usergraph-appgraph-ts.md` (Graph API throttling)

### Interactive Migration Advisor
When: starting a Slack-to-Teams migration, assessing migration scope, making migration decisions, "help me migrate", "what do I need to do to migrate"
Read:
- `slack-to-teams-ts.md`
Cross-domain deps: `MigrationDecisionMatrix.md` (decision options and defaults), `SlackToTeamsMigrationAnalysis.md` (feature status)
Note: This expert orchestrates the full migration workflow — it scans the codebase, classifies the bot profile, walks through decisions, then routes to the individual experts below for implementation.

### Composite: Full Slack → Teams Migration
When: complete end-to-end Slack bot to Teams bot migration
Read:
- `block-kit-to-adaptive-cards-ts.md`
- `slack-commands-to-teams-ts.md`
- `slack-events-to-teams-activities-ts.md`
- `slack-identity-to-aad-ts.md`
- `slack-middleware-to-teams-ts.md`
- `slack-transport-to-teams-ts.md`
- `slack-modals-to-teams-dialogs-ts.md`
- `slack-app-home-to-teams-ts.md`
- `slack-legacy-attachments-to-teams-ts.md`
- `slack-interactive-responses-to-teams-ts.md`
- `slack-files-to-teams-ts.md`
- `slack-unfurl-to-teams-link-preview-ts.md`
- `slack-shortcuts-to-teams-ts.md`
- `slack-scheduling-to-teams-ts.md`
- `slack-channel-ops-to-teams-ts.md`
- `slack-workflows-to-power-automate-ts.md`
- `slack-app-distribution-to-teams-ts.md`
- `slack-rate-limiting-resilience-ts.md`
Cross-domain deps: `../teams/project.scaffold-files-ts.md` (scaffold the new Teams project), `../teams/runtime.app-init-ts.md` (initialize the Teams app), `../teams/runtime.manifest-ts.md` (create the Teams manifest)

### Composite: Full AWS → Azure Migration
When: complete end-to-end AWS infrastructure to Azure migration
Read:
- `aws-to-azure.compute-ts.md`
- `aws-to-azure.storage-ts.md`
- `aws-to-azure.secrets-config-ts.md`
- `aws-to-azure.observability-ts.md`
Cross-domain deps: `../security/secrets-ts.md` (secrets hygiene for Azure)

## combining rule

If a request involves both Slack→Teams app migration **and** AWS→Azure infra migration, read files from **both** composite clusters.

## file inventory

`aws-to-azure.compute-ts.md` | `aws-to-azure.observability-ts.md` | `aws-to-azure.secrets-config-ts.md` | `aws-to-azure.storage-ts.md` | `block-kit-to-adaptive-cards-ts.md` | `slack-app-distribution-to-teams-ts.md` | `slack-app-home-to-teams-ts.md` | `slack-channel-ops-to-teams-ts.md` | `slack-commands-to-teams-ts.md` | `slack-events-to-teams-activities-ts.md` | `slack-files-to-teams-ts.md` | `slack-identity-to-aad-ts.md` | `slack-interactive-responses-to-teams-ts.md` | `slack-legacy-attachments-to-teams-ts.md` | `slack-middleware-to-teams-ts.md` | `slack-modals-to-teams-dialogs-ts.md` | `slack-rate-limiting-resilience-ts.md` | `slack-scheduling-to-teams-ts.md` | `slack-shortcuts-to-teams-ts.md` | `slack-to-teams-ts.md` | `slack-transport-to-teams-ts.md` | `slack-unfurl-to-teams-link-preview-ts.md` | `slack-workflows-to-power-automate-ts.md`

<!-- Updated 2026-02-11: Added slack-middleware-to-teams-ts.md and slack-transport-to-teams-ts.md for comprehensive Slack→Teams migration; updated slack-identity-to-aad-ts.md with OAuth implementation code conversion -->
<!-- Updated 2026-02-11: Added slack-modals-to-teams-dialogs-ts.md, slack-app-home-to-teams-ts.md, slack-legacy-attachments-to-teams-ts.md for complete Slack UI surface migration -->
<!-- Updated 2026-02-11: Added 9 new migration experts (interactive-responses, files, unfurl, shortcuts, scheduling, channel-ops, workflows, distribution, rate-limiting); expanded 5 existing experts (events with reactions/threading, commands with message extensions, app-home with static tabs, transport with health checks, compute with Dapr/Functions Premium) -->
<!-- Updated 2026-02-11: Added slack-to-teams-ts.md interactive migration advisor — orchestrates codebase analysis, profile classification, and per-feature decision walkthrough with defaults escape hatch -->
