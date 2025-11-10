import { requestJson } from "./httpClient";

const STORY_API_URL = process.env.STORY_API_URL ?? "https://api.storyprotocol.net";
const STORY_API_KEY = process.env.STORY_API_KEY;

export interface RegisterStoryAssetPayload {
  title: string;
  description?: string;
  ipfsHash: string;
  licenseType?: string;
  metadata?: Record<string, unknown>;
}

export interface StoryAssetResponse {
  assetId: string;
  txHash?: string;
  metadataUri?: string;
}

/**
 * Registers legal work or AI output as Story Protocol IP.
 */
export async function registerStoryAsset(payload: RegisterStoryAssetPayload): Promise<StoryAssetResponse> {
  if (!STORY_API_KEY) {
    throw new Error("Missing STORY_API_KEY environment variable.");
  }

  const endpoint = `${STORY_API_URL}/v1/assets`;
  return requestJson<StoryAssetResponse>(endpoint, {
    method: "POST",
    bearerToken: STORY_API_KEY,
    body: {
      title: payload.title,
      description: payload.description ?? "",
      ipfs_hash: payload.ipfsHash,
      license_type: payload.licenseType ?? "standard",
      metadata: payload.metadata ?? {},
    },
  });
}

/**
 * Associates an existing Story asset with licensing terms or revenue splits.
 */
export async function updateStoryAssetLicensing(assetId: string, licensingPayload: Record<string, unknown>) {
  if (!STORY_API_KEY) {
    throw new Error("Missing STORY_API_KEY environment variable.");
  }
  const endpoint = `${STORY_API_URL}/v1/assets/${assetId}/licensing`;
  return requestJson(endpoint, {
    method: "POST",
    bearerToken: STORY_API_KEY,
    body: licensingPayload,
  });
}

