import type { BigNumberish, ContractTransactionResponse, Provider, Signer } from "ethers";
import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";

import { BountyEscrowAbi, BountyRegistryAbi, HakiTokenAbi } from "./abis";

type AddressLike = `0x${string}`;

const CONTRACT_ADDRESSES = {
  bountyRegistry: import.meta.env.VITE_BOUNTY_REGISTRY_ADDRESS as AddressLike | undefined,
  bountyEscrow: import.meta.env.VITE_BOUNTY_ESCROW_ADDRESS as AddressLike | undefined,
  hakiToken: import.meta.env.VITE_HAKI_TOKEN_ADDRESS as AddressLike | undefined,
} as const;

const FALLBACK_RPC_URL = import.meta.env.VITE_PUBLIC_RPC_URL as string | undefined;

function requireAddress(address: AddressLike | undefined, label: string): AddressLike {
  if (!address) {
    throw new Error(`Missing contract address for ${label}. Set ${label.toUpperCase()} in your environment configuration.`);
  }
  return address;
}

function getFallbackProvider(): JsonRpcProvider {
  if (!FALLBACK_RPC_URL) {
    throw new Error("No RPC provider available. Provide VITE_PUBLIC_RPC_URL in your environment or install a browser wallet.");
  }
  return new JsonRpcProvider(FALLBACK_RPC_URL);
}

export async function getProvider(): Promise<Provider> {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new BrowserProvider((window as any).ethereum);
  }
  return getFallbackProvider();
}

export async function getSigner(): Promise<Signer> {
  const provider = await getProvider();
  if (provider instanceof BrowserProvider) {
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  }
  throw new Error("A browser wallet (e.g., MetaMask) is required for signing transactions.");
}

function getBountyRegistryContract(signerOrProvider: Signer | Provider) {
  const address = requireAddress(CONTRACT_ADDRESSES.bountyRegistry, "VITE_BOUNTY_REGISTRY_ADDRESS");
  return new Contract(address, BountyRegistryAbi, signerOrProvider);
}

function getBountyEscrowContract(signerOrProvider: Signer | Provider) {
  const address = requireAddress(CONTRACT_ADDRESSES.bountyEscrow, "VITE_BOUNTY_ESCROW_ADDRESS");
  return new Contract(address, BountyEscrowAbi, signerOrProvider);
}

function getHakiTokenContract(signerOrProvider: Signer | Provider) {
  const address = requireAddress(CONTRACT_ADDRESSES.hakiToken, "VITE_HAKI_TOKEN_ADDRESS");
  return new Contract(address, HakiTokenAbi, signerOrProvider);
}

export interface UpsertBountyPayload {
  bountyId: BigNumberish;
  metadataUri: string;
  active: boolean;
}

export interface LinkProofsPayload {
  bountyId: BigNumberish;
  storyAssetId: string;
  icpCanisterId: string;
  dagProofHash: string;
}

export interface SubmissionPayload extends LinkProofsPayload {
  docId: string;
}

export async function upsertBounty(payload: UpsertBountyPayload): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyRegistryContract(signer);
  return contract.upsertBounty(payload.bountyId, payload.metadataUri, payload.active);
}

export async function linkBountyProofs(payload: LinkProofsPayload): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyRegistryContract(signer);
  return contract.linkBountyProofs(payload.bountyId, payload.storyAssetId, payload.icpCanisterId, payload.dagProofHash);
}

export async function registerSubmission(payload: SubmissionPayload): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyRegistryContract(signer);
  return contract.registerSubmission(
    payload.bountyId,
    payload.docId,
    payload.storyAssetId,
    payload.icpCanisterId,
    payload.dagProofHash,
  );
}

export interface CreateEscrowPayload {
  bountyId: BigNumberish;
  beneficiary: AddressLike;
  amountWei: BigNumberish;
}

export async function createEscrow(payload: CreateEscrowPayload): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyEscrowContract(signer);
  return contract.createEscrow(payload.bountyId, payload.beneficiary, {
    value: payload.amountWei,
  });
}

export async function anchorDagProof(bountyId: BigNumberish, dagProofHash: string): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyEscrowContract(signer);
  return contract.anchorDagProof(bountyId, dagProofHash);
}

export async function releaseEscrow(bountyId: BigNumberish): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyEscrowContract(signer);
  return contract.release(bountyId);
}

export async function refundEscrow(bountyId: BigNumberish): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getBountyEscrowContract(signer);
  return contract.refund(bountyId);
}

export interface MintWithProvenancePayload {
  to: AddressLike;
  amountWei: BigNumberish;
  storyAssetId: string;
  icpCanisterId: string;
  dagProofHash: string;
  workflowTag: string;
}

export async function mintHakiTokenWithProvenance(
  payload: MintWithProvenancePayload,
): Promise<ContractTransactionResponse> {
  const signer = await getSigner();
  const contract = getHakiTokenContract(signer);
  return contract.mintWithProvenance(
    payload.to,
    payload.amountWei,
    payload.storyAssetId,
    payload.icpCanisterId,
    payload.dagProofHash,
    payload.workflowTag,
  );
}

export async function getBounty(bountyId: BigNumberish) {
  const provider = await getProvider();
  const contract = getBountyRegistryContract(provider);
  return contract.getBounty(bountyId);
}

export async function getBountySubmissions(bountyId: BigNumberish) {
  const provider = await getProvider();
  const contract = getBountyRegistryContract(provider);
  const total: bigint = await contract.getSubmissionCount(bountyId);
  const submissions = [];
  for (let i = 0n; i < total; i += 1n) {
    submissions.push(await contract.getSubmission(bountyId, i));
  }
  return submissions;
}

export async function getEscrow(bountyId: BigNumberish) {
  const provider = await getProvider();
  const contract = getBountyEscrowContract(provider);
  return contract.getEscrow(bountyId);
}

export async function getProvenance(workflowId: string) {
  const provider = await getProvider();
  const contract = getHakiTokenContract(provider);
  return contract.provenanceByWorkflow(workflowId);
}

export const blockchainContracts = {
  bountyRegistry: () => requireAddress(CONTRACT_ADDRESSES.bountyRegistry, "VITE_BOUNTY_REGISTRY_ADDRESS"),
  bountyEscrow: () => requireAddress(CONTRACT_ADDRESSES.bountyEscrow, "VITE_BOUNTY_ESCROW_ADDRESS"),
  hakiToken: () => requireAddress(CONTRACT_ADDRESSES.hakiToken, "VITE_HAKI_TOKEN_ADDRESS"),
};

