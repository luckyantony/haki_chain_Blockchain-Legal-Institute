import { requestJson } from "./httpClient";

const DAG_API_URL = process.env.DAG_API_URL ?? "https://constellation.example.com";
const DAG_API_KEY = process.env.DAG_API_KEY;

export interface DagProofPayload {
  workflowId: string;
  docId: string;
  summaryHash: string;
  evidence: Record<string, unknown>;
}

export interface DagProofResponse {
  dagHash: string;
  submittedAt: string;
  blockHeight?: number;
}

/**
 * Records an AI agent reasoning trail onto Constellation's DAG network.
 */
export async function recordDagProof(payload: DagProofPayload): Promise<DagProofResponse> {
  if (!DAG_API_KEY) {
    throw new Error("Missing DAG_API_KEY environment variable.");
  }

  const endpoint = `${DAG_API_URL}/v1/proofs`;
  return requestJson<DagProofResponse>(endpoint, {
    method: "POST",
    bearerToken: DAG_API_KEY,
    body: {
      workflow_id: payload.workflowId,
      document_id: payload.docId,
      summary_hash: payload.summaryHash,
      evidence: payload.evidence,
    },
  });
}

/**
 * Retrieves proof status for audit and settlement workflows.
 */
export async function getDagProof(dagHash: string) {
  const endpoint = `${DAG_API_URL}/v1/proofs/${dagHash}`;
  return requestJson(endpoint, {
    method: "GET",
    bearerToken: DAG_API_KEY,
  });
}

