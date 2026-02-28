/**
 * Environment variable loader with validation.
 * Fails fast on missing required vars at startup.
 */

export interface AppConfig {
  // Teams
  clientId: string;
  clientSecret: string;
  tenantId: string;
  port: number;

  // Slack
  slackBotToken: string;
  slackAppToken: string;
  slackSigningSecret: string;

  // Feature flags
  enableEphemeral: boolean;
  enableThreadBroadcast: boolean;
  enableFileUpload: boolean;
  enableConfirmation: boolean;

  // Logging
  logLevel: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalBool(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
}

export function loadConfig(): AppConfig {
  return {
    clientId: requireEnv("CLIENT_ID"),
    clientSecret: requireEnv("CLIENT_SECRET"),
    tenantId: requireEnv("TENANT_ID"),
    port: Number(process.env.PORT) || 3978,

    slackBotToken: requireEnv("SLACK_BOT_TOKEN"),
    slackAppToken: requireEnv("SLACK_APP_TOKEN"),
    slackSigningSecret: requireEnv("SLACK_SIGNING_SECRET"),

    enableEphemeral: optionalBool("ENABLE_EPHEMERAL", true),
    enableThreadBroadcast: optionalBool("ENABLE_THREAD_BROADCAST", true),
    enableFileUpload: optionalBool("ENABLE_FILE_UPLOAD", true),
    enableConfirmation: optionalBool("ENABLE_CONFIRMATION", true),

    logLevel: process.env.LOG_LEVEL ?? "info",
  };
}
