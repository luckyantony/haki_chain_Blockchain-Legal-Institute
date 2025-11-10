export const BountyRegistryAbi = [
  "function upsertBounty(uint256 bountyId, string metadataUri, bool active)",
  "function linkBountyProofs(uint256 bountyId, string storyAssetId, string icpCanisterId, string dagProofHash)",
  "function registerSubmission(uint256 bountyId, string docId, string storyAssetId, string icpCanisterId, string dagProofHash)",
  "function getBounty(uint256 bountyId) view returns (tuple(address creator, string metadataUri, string storyAssetId, string icpCanisterId, string dagProofHash, bool active))",
  "function getSubmissionCount(uint256 bountyId) view returns (uint256)",
  "function getSubmission(uint256 bountyId, uint256 index) view returns (tuple(address submitter, string docId, string storyAssetId, string icpCanisterId, string dagProofHash, uint256 timestamp))",
  "event BountyCreated(uint256 indexed bountyId, address indexed creator, string metadataUri)",
  "event BountyStatusUpdated(uint256 indexed bountyId, bool active)",
  "event BountyProofsLinked(uint256 indexed bountyId, string storyAssetId, string icpCanisterId, string dagProofHash)",
  "event SubmissionRegistered(uint256 indexed bountyId, address indexed submitter, string docId, string storyAssetId, string icpCanisterId, string dagProofHash)",
] as const;

export const BountyEscrowAbi = [
  "function createEscrow(uint256 bountyId, address beneficiary) payable",
  "function anchorDagProof(uint256 bountyId, string dagProofHash)",
  "function release(uint256 bountyId)",
  "function refund(uint256 bountyId)",
  "function getEscrow(uint256 bountyId) view returns (tuple(address funder, address beneficiary, uint256 amount, string dagProofHash, bool released, bool refunded, uint256 createdAt, uint256 finalizedAt))",
  "event EscrowCreated(uint256 indexed bountyId, address indexed funder, address indexed beneficiary, uint256 amount)",
  "event DagProofAnchored(uint256 indexed bountyId, string dagProofHash)",
  "event EscrowReleased(uint256 indexed bountyId, address indexed beneficiary, uint256 amount)",
  "event EscrowRefunded(uint256 indexed bountyId, address indexed funder, uint256 amount)",
] as const;

export const HakiTokenAbi = [
  "function mintWithProvenance(address to, uint256 amount, string storyAssetId, string icpCanisterId, string dagProofHash, string workflowTag)",
  "function provenanceByWorkflow(bytes32 workflowId) view returns (tuple(string storyAssetId, string icpCanisterId, string dagProofHash, uint256 mintedAmount, uint256 timestamp))",
  "function grantMinterRole(address account)",
  "function revokeMinterRole(address account)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function MINTER_ROLE() pure returns (bytes32)",
  "event ProvenanceLogged(bytes32 indexed workflowId, address indexed to, uint256 amount, string storyAssetId, string icpCanisterId, string dagProofHash)",
] as const;

export type BountyRegistryAbiType = typeof BountyRegistryAbi;
export type BountyEscrowAbiType = typeof BountyEscrowAbi;
export type HakiTokenAbiType = typeof HakiTokenAbi;

