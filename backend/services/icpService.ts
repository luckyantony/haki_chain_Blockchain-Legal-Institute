import { requestJson } from "./httpClient";

const ICP_API_URL = process.env.ICP_API_URL ?? "https://icp-api.example.com";
const ICP_AGENT_ID = process.env.ICP_AGENT_ID;
const ICP_AUTH_TOKEN = process.env.ICP_AUTH_TOKEN;

export interface StoreIcpMetadataPayload {
  docId: string;
  hash: string;
  metadata: Record<string, unknown>;
}

export interface IcpMetadataResponse {
  canisterId: string;
  recordId: string;
  anchorCid?: string;
}

/**
 * Persists metadata for a document or AI output inside an ICP canister.
 */
export async function storeIcpMetadata(payload: StoreIcpMetadataPayload): Promise<IcpMetadataResponse> {
  if (!ICP_AGENT_ID) {
    throw new Error("Missing ICP_AGENT_ID environment variable.");
  }

  const endpoint = `${ICP_API_URL}/canisters/${ICP_AGENT_ID}/metadata`;
  return requestJson<IcpMetadataResponse>(endpoint, {
    method: "POST",
    bearerToken: ICP_AUTH_TOKEN,
    body: {
      doc_id: payload.docId,
      sha256_hash: payload.hash,
      metadata: payload.metadata,
    },
  });
}

/**
 * Fetches previously stored metadata to verify tamper-proof anchoring.
 */
export async function getIcpMetadata(canisterId: string, recordId: string) {
  const endpoint = `${ICP_API_URL}/canisters/${canisterId}/metadata/${recordId}`;
  return requestJson(endpoint, {
    method: "GET",
    bearerToken: ICP_AUTH_TOKEN,
  });
}

