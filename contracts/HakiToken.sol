// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title HakiToken
 * @notice ERC20 token with provenance tagging for Story Protocol, ICP canisters, and Constellation DAG proofs.
 * @dev Mint operations emit hashes tying tokenized legal work to cross-chain records. Supports multi-module minters.
 */
contract HakiToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct Provenance {
        string storyAssetId;
        string icpCanisterId;
        string dagProofHash;
        uint256 mintedAmount;
        uint256 timestamp;
    }

    mapping(bytes32 workflowId => Provenance) private _provenanceByWorkflow;

    event ProvenanceLogged(
        bytes32 indexed workflowId,
        address indexed to,
        uint256 amount,
        string storyAssetId,
        string icpCanisterId,
        string dagProofHash
    );

    constructor(address admin) ERC20("HakiChain Token", "HAKI") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }

    /**
     * @notice Mint HAKI tokens while anchoring provenance references.
     * @param to Recipient of the minted tokens.
     * @param amount Amount of tokens to mint (18 decimal precision).
     * @param storyAssetId Story Protocol asset identifier for the underlying IP.
     * @param icpCanisterId ICP canister storing metadata hashes.
     * @param dagProofHash Constellation DAG hash for agentic reasoning trace.
     * @param workflowTag Arbitrary tag (e.g., AI agent run ID) supplied by off-chain workflow.
     */
    function mintWithProvenance(
        address to,
        uint256 amount,
        string calldata storyAssetId,
        string calldata icpCanisterId,
        string calldata dagProofHash,
        string calldata workflowTag
    ) external onlyRole(MINTER_ROLE) {
        bytes32 workflowId = keccak256(
            abi.encodePacked(workflowTag, storyAssetId, icpCanisterId, dagProofHash)
        );

        _mint(to, amount);

        _provenanceByWorkflow[workflowId] = Provenance({
            storyAssetId: storyAssetId,
            icpCanisterId: icpCanisterId,
            dagProofHash: dagProofHash,
            mintedAmount: amount,
            timestamp: block.timestamp
        });

        emit ProvenanceLogged(workflowId, to, amount, storyAssetId, icpCanisterId, dagProofHash);
    }

    function grantMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, account);
    }

    function revokeMinterRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(MINTER_ROLE, account);
    }

    function provenanceByWorkflow(bytes32 workflowId) external view returns (Provenance memory) {
        return _provenanceByWorkflow[workflowId];
    }
}

