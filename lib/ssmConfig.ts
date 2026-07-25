import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const SSM_PREFIX = "/recieptScanner/prod";
const SSM_KEYS = [
  "ANTHROPIC_API_KEY",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
  "GOOGLE_SHEET_ID",
] as const;

type SsmKey = (typeof SSM_KEYS)[number];

let cache: Partial<Record<SsmKey, string>> | null = null;
let cacheError: string | null = null;

async function loadFromSsm(): Promise<void> {
  if (cache || cacheError) return;
  try {
    const client = new SSMClient({ region: process.env.AWS_REGION || "us-east-2" });
    const result: Partial<Record<SsmKey, string>> = {};
    for (const key of SSM_KEYS) {
      const res = await client.send(
        new GetParameterCommand({ Name: `${SSM_PREFIX}/${key}`, WithDecryption: true })
      );
      if (res.Parameter?.Value) result[key] = res.Parameter.Value;
    }
    cache = result;
  } catch (err) {
    cacheError = err instanceof Error ? err.message : String(err);
  }
}

export async function getConfigValue(key: SsmKey): Promise<string | undefined> {
  if (process.env[key]) return process.env[key];
  await loadFromSsm();
  if (cacheError) {
    throw new Error(
      `${key} is not set via process.env, and SSM fallback failed: ${cacheError}`
    );
  }
  return cache?.[key];
}
