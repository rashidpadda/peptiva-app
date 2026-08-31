// Server-only client for Jumio's KYX Orchestration API. Never import this
// from a "use client" component - it reads JUMIO_API_SECRET, which must
// stay server-side. Only the /api/jumio/* route handlers should call these.
//
// Every value below was verified against the real sandbox (unauthenticated
// probes + a live token exchange + a live Initiate call), not assumed from
// training knowledge - see the specifics in each comment.
//
// Initiate and Retrieve live on two DIFFERENT hosts, not one shared base
// URL. The region code is a Jumio datacenter id like "amer-1" (matching
// deposit-onboarding's ALLOWED_JUMIO_IFRAME_ORIGINS entry
// "ibanera.web.amer-1.jumio.ai"), not a plain "us"/"eu"/"sg" code.
const DATACENTER = process.env.JUMIO_DATACENTER || "amer-1";
const AUTH_BASE_URL = `https://auth.${DATACENTER}.jumio.ai`;
const ACCOUNT_BASE_URL = `https://account.${DATACENTER}.jumio.ai/api/v1`;
const RETRIEVAL_BASE_URL = `https://retrieval.${DATACENTER}.jumio.ai/api/v1`;

// The three hosts don't even share an error shape: account.* returns
// {message, httpStatus, requestURI}, retrieval.* returns an RFC7807-style
// {title, status, detail}, auth.* (OAuth2) returns {error, error_description}.
function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.message === "string") return obj.message;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.error_description === "string") return obj.error_description;
    if (typeof obj.error === "string") return obj.error;
  }
  return fallback;
}

function basicAuthHeader(): string {
  const token = process.env.JUMIO_API_TOKEN;
  const secret = process.env.JUMIO_API_SECRET;
  if (!token || !secret) {
    throw new JumioConfigError("JUMIO_API_TOKEN and JUMIO_API_SECRET must be set in the environment.");
  }
  return `Basic ${Buffer.from(`${token}:${secret}`).toString("base64")}`;
}

// account.*/retrieval.* don't take the API token/secret directly - they take
// a short-lived Bearer token minted by a separate OAuth2 endpoint (confirmed
// against the real sandbox: Basic-Auth'ing the account/retrieval hosts
// directly returned "Unauthorized: Bad credentials", but exchanging the same
// token/secret here returns a real access_token). Cached in-memory and
// re-used until shortly before it expires (60 min per Jumio's docs) so we're
// not minting a fresh token on every request.
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getBearerToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.accessToken;
  }

  const response = await fetch(`${AUTH_BASE_URL}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: basicAuthHeader(),
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.access_token) {
    throw new Error(
      extractErrorMessage(data, `Jumio OAuth2 token request failed with status ${response.status}`)
    );
  }

  // Shave 30s off the reported lifetime as a safety margin against clock
  // drift / in-flight requests near expiry.
  const expiresInMs = ((data.expires_in ?? 3600) - 30) * 1000;
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + expiresInMs };
  return cachedToken.accessToken;
}

export class JumioConfigError extends Error {}

export type JumioInitiateResult = {
  accountId: string;
  workflowExecutionId: string;
  redirectUrl: string;
};

export async function initiateJumioWorkflow(params: {
  customerInternalReference: string;
  userReference: string;
}): Promise<JumioInitiateResult> {
  const workflowId = process.env.JUMIO_WORKFLOW_ID;
  if (!workflowId) {
    throw new JumioConfigError("JUMIO_WORKFLOW_ID must be set in the environment.");
  }

  const response = await fetch(`${ACCOUNT_BASE_URL}/accounts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await getBearerToken()}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      // Jumio requires a User-Agent identifying the integration.
      "User-Agent": "PEPTIVA-QuickBuy/1.0",
    },
    body: JSON.stringify({
      customerInternalReference: params.customerInternalReference,
      userReference: params.userReference,
      workflowDefinition: {
        key: Number(workflowId),
      },
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `Jumio initiate failed with status ${response.status}`));
  }

  const accountId = data?.account?.id;
  const workflowExecutionId = data?.workflowExecution?.id;
  const redirectUrl = data?.web?.href;

  if (!accountId || !workflowExecutionId || !redirectUrl) {
    throw new Error("Jumio initiate response was missing account.id, workflowExecution.id, or web.href.");
  }

  return { accountId, workflowExecutionId, redirectUrl };
}

export type JumioDecision = "PASSED" | "FAILED" | "WARNING" | "NOT_EXECUTED" | null;

export type JumioStatusResult = {
  status: string;
  decision: JumioDecision;
};

export async function retrieveJumioWorkflowStatus(params: {
  accountId: string;
  workflowExecutionId: string;
}): Promise<JumioStatusResult> {
  const response = await fetch(
    `${RETRIEVAL_BASE_URL}/accounts/${params.accountId}/workflow-executions/${params.workflowExecutionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${await getBearerToken()}`,
        Accept: "application/json",
        "User-Agent": "PEPTIVA-QuickBuy/1.0",
      },
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data, `Jumio retrieve failed with status ${response.status}`));
  }

  // Confirmed against the real API (both a live probe and Jumio's docs):
  // the response root is {workflow: {status, ...}, decision: {type, ...},
  // account, capabilities, ...} - there is no "workflowExecution" key at
  // all in the Retrieve response (that name only applies to the Initiate
  // response's workflowExecution.id). "decision" only appears once
  // workflow.status is "PROCESSED"; before that it's simply absent.
  return {
    status: data?.workflow?.status ?? "UNKNOWN",
    decision: data?.decision?.type ?? null,
  };
}
