// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BountyEscrow
 * @notice Manages on-chain escrow for legal bounties while anchoring Constellation DAG proofs for audit trails.
 * @dev Funds are denominated in native currency (ETH on Ethereum testnets). Designed for simple plug-and-play usage.
 */
contract BountyEscrow is Ownable, ReentrancyGuard {
    struct Escrow {
        address funder;
        address payable beneficiary;
        uint256 amount;
        string dagProofHash;
        bool released;
        bool refunded;
        uint256 createdAt;
        uint256 finalizedAt;
    }

    mapping(uint256 bountyId => Escrow) private _escrows;

    event EscrowCreated(
        uint256 indexed bountyId,
        address indexed funder,
        address indexed beneficiary,
        uint256 amount
    );
    event DagProofAnchored(uint256 indexed bountyId, string dagProofHash);
    event EscrowReleased(uint256 indexed bountyId, address indexed beneficiary, uint256 amount);
    event EscrowRefunded(uint256 indexed bountyId, address indexed funder, uint256 amount);

    error EscrowAlreadyExists(uint256 bountyId);
    error EscrowNotFound(uint256 bountyId);
    error NothingToRelease(uint256 bountyId);
    error AlreadyFinalized(uint256 bountyId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Creates and funds an escrow for a bounty. The funds are locked until released or refunded.
     * @param bountyId Off-chain managed bounty identifier.
     * @param beneficiary Address entitled to receive the funds upon successful submission.
     */
    function createEscrow(uint256 bountyId, address payable beneficiary) external payable {
        if (_escrows[bountyId].createdAt != 0) {
            revert EscrowAlreadyExists(bountyId);
        }
        if (msg.value == 0) {
            revert NothingToRelease(bountyId);
        }

        _escrows[bountyId] = Escrow({
            funder: msg.sender,
            beneficiary: beneficiary,
            amount: msg.value,
            dagProofHash: "",
            released: false,
            refunded: false,
            createdAt: block.timestamp,
            finalizedAt: 0
        });

        emit EscrowCreated(bountyId, msg.sender, beneficiary, msg.value);
    }

    /**
     * @notice Anchor the Constellation DAG hash for the reasoning that justifies payout.
     * @dev Only the contract owner (platform operator) can anchor proofs to avoid malicious overwrite.
     */
    function anchorDagProof(uint256 bountyId, string calldata dagProofHash) external onlyOwner {
        Escrow storage escrow = _escrows[bountyId];
        if (escrow.createdAt == 0) {
            revert EscrowNotFound(bountyId);
        }
        if (escrow.released || escrow.refunded) {
            revert AlreadyFinalized(bountyId);
        }

        escrow.dagProofHash = dagProofHash;

        emit DagProofAnchored(bountyId, dagProofHash);
    }

    /**
     * @notice Releases escrowed funds to the beneficiary once proofs have been verified.
     */
    function release(uint256 bountyId) external onlyOwner nonReentrant {
        Escrow storage escrow = _escrows[bountyId];
        if (escrow.createdAt == 0) {
            revert EscrowNotFound(bountyId);
        }
        if (escrow.released || escrow.refunded) {
            revert AlreadyFinalized(bountyId);
        }
        if (escrow.amount == 0) {
            revert NothingToRelease(bountyId);
        }

        uint256 amount = escrow.amount;
        escrow.amount = 0;
        escrow.released = true;
        escrow.finalizedAt = block.timestamp;

        (bool success, ) = escrow.beneficiary.call{value: amount}("");
        require(success, "Transfer failed");

        emit EscrowReleased(bountyId, escrow.beneficiary, amount);
    }

    /**
     * @notice Refunds the funder if the bounty is cancelled.
     */
    function refund(uint256 bountyId) external onlyOwner nonReentrant {
        Escrow storage escrow = _escrows[bountyId];
        if (escrow.createdAt == 0) {
            revert EscrowNotFound(bountyId);
        }
        if (escrow.released || escrow.refunded) {
            revert AlreadyFinalized(bountyId);
        }
        if (escrow.amount == 0) {
            revert NothingToRelease(bountyId);
        }

        uint256 amount = escrow.amount;
        escrow.amount = 0;
        escrow.refunded = true;
        escrow.finalizedAt = block.timestamp;

        (bool success, ) = payable(escrow.funder).call{value: amount}("");
        require(success, "Refund failed");

        emit EscrowRefunded(bountyId, escrow.funder, amount);
    }

    function getEscrow(uint256 bountyId) external view returns (Escrow memory) {
        Escrow memory escrow = _escrows[bountyId];
        if (escrow.createdAt == 0) {
            revert EscrowNotFound(bountyId);
        }
        return escrow;
    }
}

