// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title BountyRegistry
 * @notice Tracks legal bounty metadata and cross-chain provenance references for Story, ICP, and Constellation DAG.
 * @dev Designed to be plug-and-play for AI-generated and human-generated submissions that require on-chain proofs.
 */
contract BountyRegistry {
    struct Bounty {
        address creator;
        string metadataUri;
        string storyAssetId;
        string icpCanisterId;
        string dagProofHash;
        bool active;
    }

    struct Submission {
        address submitter;
        string docId;
        string storyAssetId;
        string icpCanisterId;
        string dagProofHash;
        uint256 timestamp;
    }

    mapping(uint256 bountyId => Bounty) private _bounties;
    mapping(uint256 bountyId => Submission[]) private _submissions;

    event BountyCreated(uint256 indexed bountyId, address indexed creator, string metadataUri);
    event BountyStatusUpdated(uint256 indexed bountyId, bool active);
    event BountyProofsLinked(
        uint256 indexed bountyId,
        string storyAssetId,
        string icpCanisterId,
        string dagProofHash
    );
    event SubmissionRegistered(
        uint256 indexed bountyId,
        address indexed submitter,
        string docId,
        string storyAssetId,
        string icpCanisterId,
        string dagProofHash
    );

    error BountyNotFound(uint256 bountyId);
    error BountyNotActive(uint256 bountyId);
    error SubmissionIndexOutOfBounds(uint256 bountyId, uint256 requestedIndex);

    /**
     * @notice Create or overwrite a bounty definition with metadata and activate it.
     * @dev Bounty identifiers are managed off-chain (e.g., Django backend) to align with AI workflows.
     */
    function upsertBounty(uint256 bountyId, string calldata metadataUri, bool active) external {
        Bounty storage bounty = _bounties[bountyId];
        bool isNew = bounty.creator == address(0);
        bounty.creator = msg.sender;
        bounty.metadataUri = metadataUri;
        bounty.active = active;

        if (isNew) {
            emit BountyCreated(bountyId, msg.sender, metadataUri);
        } else {
            emit BountyStatusUpdated(bountyId, active);
        }
    }

    /**
     * @notice Link external proof references for a bounty in bulk.
     * @param bountyId Identifier managed off-chain.
     * @param storyAssetId Story Protocol asset identifier.
     * @param icpCanisterId ICP canister ID where the metadata hash is stored.
     * @param dagProofHash Constellation DAG hash representing agentic reasoning chain.
     */
    function linkBountyProofs(
        uint256 bountyId,
        string calldata storyAssetId,
        string calldata icpCanisterId,
        string calldata dagProofHash
    ) external {
        Bounty storage bounty = _bounties[bountyId];
        if (bounty.creator == address(0)) {
            revert BountyNotFound(bountyId);
        }
        bounty.storyAssetId = storyAssetId;
        bounty.icpCanisterId = icpCanisterId;
        bounty.dagProofHash = dagProofHash;

        emit BountyProofsLinked(bountyId, storyAssetId, icpCanisterId, dagProofHash);
    }

    /**
     * @notice Register a submission with its cross-chain references.
     * @dev Requires the bounty to be active. Off-chain services should ensure docId uniqueness as needed.
     */
    function registerSubmission(
        uint256 bountyId,
        string calldata docId,
        string calldata storyAssetId,
        string calldata icpCanisterId,
        string calldata dagProofHash
    ) external {
        Bounty storage bounty = _bounties[bountyId];
        if (bounty.creator == address(0)) {
            revert BountyNotFound(bountyId);
        }
        if (!bounty.active) {
            revert BountyNotActive(bountyId);
        }

        _submissions[bountyId].push(
            Submission({
                submitter: msg.sender,
                docId: docId,
                storyAssetId: storyAssetId,
                icpCanisterId: icpCanisterId,
                dagProofHash: dagProofHash,
                timestamp: block.timestamp
            })
        );

        emit SubmissionRegistered(
            bountyId,
            msg.sender,
            docId,
            storyAssetId,
            icpCanisterId,
            dagProofHash
        );
    }

    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        Bounty memory bounty = _bounties[bountyId];
        if (bounty.creator == address(0)) {
            revert BountyNotFound(bountyId);
        }
        return bounty;
    }

    function getSubmissionCount(uint256 bountyId) external view returns (uint256) {
        return _submissions[bountyId].length;
    }

    function getSubmission(
        uint256 bountyId,
        uint256 index
    ) external view returns (Submission memory) {
        if (index >= _submissions[bountyId].length) {
            revert SubmissionIndexOutOfBounds(bountyId, index);
        }
        return _submissions[bountyId][index];
    }
}

