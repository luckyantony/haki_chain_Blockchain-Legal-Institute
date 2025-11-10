# HakiChain Backend Services

This directory contains lightweight service wrappers for the external networks used in the HakiChain LegalTech MVP:

| Service | Role | File |
| --- | --- | --- |
| Story Protocol | Register AI/legal IP with provenance metadata | `services/storyService.ts` |
| Internet Computer (ICP) | Persist document hashes and metadata in canisters | `services/icpService.ts` |
| Constellation DAG | Record AI agent reasoning proofs for auditability | `services/constellationService.ts` |

## Environment Configuration

Create a `.env` file at the repository root (or export the variables in your shell) with the following keys:

```bash
STORY_API_KEY=...
STORY_API_URL=https://api.storyprotocol.net

ICP_AGENT_ID=...
ICP_AUTH_TOKEN=...
ICP_API_URL=https://your-icp-relayer.example.com

DAG_API_KEY=...
DAG_API_URL=https://constellation.example.com
```

> Each service wrapper reads these variables at runtime; they are intentionally decoupled from the frontend so other teams can integrate or deploy them independently.

## Usage Pattern

The service functions return JSON responses and throw rich errors on failure:

```ts
import {
  registerStoryAsset,
  storeIcpMetadata,
  recordDagProof,
} from "../backend/services";

const story = await registerStoryAsset({
  title: "HakiLens Summary",
  ipfsHash: "ipfs://...",
  metadata: { caseId: "CASE-001" },
});

const icp = await storeIcpMetadata({
  docId: "CASE-001::summary",
  hash: "0xabc123",
  metadata: { storyAssetId: story.assetId },
});

const dag = await recordDagProof({
  workflowId: "hakilens-123",
  docId: "CASE-001::summary",
  summaryHash: "0xdef456",
  evidence: { icpRecordId: icp.recordId },
});
```

These calls can be orchestrated from FastAPI, Django, or any server-side worker to maintain a clean separation between the blockchain/legal provenance layer and the UI.

