# toolkit.playground-ts

## purpose

Agents Playground — the local web-based test harness for testing Teams agents without deploying to the Teams client.

## rules

1. **Agents Playground is a local web UI for testing.** It provides a browser-based chat interface that simulates a Teams conversation. No Teams client or sideloading required for basic message testing.
2. **Start with `teamsapp preview`.** The CLI command starts the local bot server and opens the Agents Playground in the default browser. Alternatively, use the VS Code command palette: "Agents Toolkit: Preview".
3. **`.m365agentsplayground.yml` configures the playground.** This optional config file in the project root customizes playground behavior — bot endpoint URL, display settings, and test scenarios.
4. **The playground connects to your local bot endpoint.** By default it connects to `http://localhost:3978/api/messages` (or whatever port your bot runs on). Ensure your bot server is running before or alongside the playground.
5. **Send messages to test conversation flows.** Type messages in the playground chat to simulate user input. The bot processes them through the same handler pipeline as in production Teams.
6. **Card actions work in the playground.** Adaptive Card actions (submit, execute) are supported. Test card interactions without deploying to Teams.
7. **Activity simulation for advanced testing.** The playground can simulate Teams-specific activities like `conversationUpdate` (member added/removed), `messageReaction`, and `invoke` activities that are hard to trigger manually.
8. **The playground does NOT replace Teams client testing.** It simulates core messaging and card interactions but does not support: SSO/OAuth popups, message extensions, task modules, meeting-specific features, or the full Teams app manifest experience. Always do a final validation in the real Teams client.
9. **`teamsapp preview --env <name>` uses environment-specific config.** The preview command loads environment variables from the specified env files, allowing you to test against different configurations.
10. **Hot reload works with the playground.** If your bot server supports hot reload (e.g., `nodemon` or `tsx watch`), changes to bot code are reflected immediately without restarting the playground.

## patterns

### Pattern 1: Starting Agents Playground

```bash
# Option 1: CLI — starts bot + opens playground
teamsapp preview

# Option 2: CLI — target a specific environment
teamsapp preview --env dev

# Option 3: Start bot separately, then preview
npm run dev          # Start bot server on localhost:3978
teamsapp preview     # Opens playground, connects to running bot

# Option 4: VS Code command palette
# > Agents Toolkit: Preview
```

### Pattern 2: .m365agentsplayground.yml configuration

```yaml
# .m365agentsplayground.yml — optional playground configuration
version: v1.0

# Bot endpoint the playground connects to
botEndpoint: http://localhost:3978/api/messages

# Display name shown in the playground chat header
botName: My Teams Bot

# Optional: pre-configured test messages
testScenarios:
  - name: "Greeting"
    message: "Hello"
  - name: "Help command"
    message: "help"
  - name: "Complex query"
    message: "What are the sales figures for Q4?"
```

### Pattern 3: Local development workflow with playground

```jsonc
// package.json — scripts for playground development
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "preview": "teamsapp preview",
    "dev:playground": "concurrently \"npm run dev\" \"npm run preview\""
  }
}
```

```typescript
// src/index.ts — bot entry point
import { Application, TurnState } from '@microsoft/teams-ai';

const app = new Application<TurnState>({
  // In playground mode, the bot runs locally
  // No special config needed — same code works in playground and Teams
});

app.message('/test', async (ctx) => {
  await ctx.send('Playground test successful!');
});

app.message(/.*/, async (ctx) => {
  await ctx.send(`You said: ${ctx.activity.text}`);
});

// Start the server
const port = process.env.PORT || 3978;
app.listen(port, () => {
  console.log(`Bot running at http://localhost:${port}`);
  console.log(`Run "teamsapp preview" to open Agents Playground`);
});
```

## pitfalls

- **Bot server not running when playground starts** — The playground connects to your local bot endpoint. If the server isn't running, you'll see connection errors. Start the bot first or use `concurrently`.
- **Wrong port in playground config** — If your bot runs on a non-default port, update `.m365agentsplayground.yml` or the `BOT_ENDPOINT` env variable.
- **Testing SSO in the playground** — OAuth/SSO flows require the real Teams client. The playground cannot simulate the Teams SSO token exchange. Use the playground for message/card testing, Teams client for auth flows.
- **Assuming playground = Teams client** — Message extensions, task modules, meeting features, and app installation flows are not available in the playground. Always validate in Teams before publishing.
- **Forgetting `--env` for environment-specific testing** — Without `--env`, preview uses the default dev environment. If you need staging credentials or endpoints, specify the environment.
- **Firewall blocking localhost** — Some corporate networks block local WebSocket connections. If the playground can't connect, check firewall rules for localhost ports.
- **Hot reload not configured** — Without `tsx watch` or `nodemon`, code changes require manual server restart. Set up hot reload for efficient playground development.
- **Card rendering differences** — Adaptive Card rendering in the playground may differ slightly from the Teams client. Complex card layouts should be verified in Teams.

## references

- [Test with Agents Playground](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/debug-overview)
- [teamsapp preview command](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/toolkit-cli)
- [Local debug overview](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/debug-overview)
- [Agents Toolkit VS Code extension](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/install-teams-toolkit)

## instructions

Do a web search for:

- "Microsoft 365 Agents Playground local testing Teams bot 2025"
- "teamsapp preview Agents Playground configuration"
- ".m365agentsplayground.yml configuration options"

Pair with:
- `dev.debug-test-ts.md` — broader debugging and testing patterns
- `toolkit.lifecycle-cli.md` — `teamsapp preview` is part of the CLI command set
- `toolkit.environments.md` — playground uses environment-specific config
- `runtime.app-init-ts.md` — bot entry point that playground connects to

## research

Deep Research prompt:

"Write a micro expert on Microsoft 365 Agents Playground for testing Teams bots locally (TypeScript). Cover what the playground is, how to start it (teamsapp preview, VS Code command), .m365agentsplayground.yml configuration, testing capabilities (messages, card actions, activity simulation), limitations vs real Teams client (no SSO, no message extensions, no task modules), hot reload workflow, and environment-specific preview. Include canonical patterns for: starting the playground, playground config file, local dev workflow with concurrent bot server and playground."
