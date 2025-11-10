import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("HakiChain Contracts", function () {
  describe("BountyRegistry", function () {
    it("registers submissions with cross-chain proofs", async function () {
      const [creator, submitter] = await ethers.getSigners();
      const registryFactory = await ethers.getContractFactory("BountyRegistry");
      const registry = await registryFactory.deploy();

      await registry.connect(creator).upsertBounty(1, "ipfs://bounty-metadata", true);
      await registry
        .connect(submitter)
        .registerSubmission(
          1,
          "doc-123",
          "story-asset",
          "icp-canister",
          "dag-proof-hash",
        );

      const bounty = await registry.getBounty(1);
      expect(bounty.creator).to.equal(creator.address);

      const submissionCount = await registry.getSubmissionCount(1);
      expect(submissionCount).to.equal(1n);

      const submission = await registry.getSubmission(1, 0);
      expect(submission.submitter).to.equal(submitter.address);
      expect(submission.storyAssetId).to.equal("story-asset");
      expect(submission.icpCanisterId).to.equal("icp-canister");
      expect(submission.dagProofHash).to.equal("dag-proof-hash");
    });
  });

  describe("BountyEscrow", function () {
    it("holds funds and releases upon proof anchoring", async function () {
      const [owner, funder, beneficiary] = await ethers.getSigners();
      const escrowFactory = await ethers.getContractFactory("BountyEscrow");
      const escrow = await escrowFactory.deploy(owner.address);

      await escrow.connect(funder).createEscrow(1, beneficiary.address, { value: ethers.parseEther("1") });
      const stored = await escrow.getEscrow(1);
      expect(stored.amount).to.equal(ethers.parseEther("1"));

      await escrow.connect(owner).anchorDagProof(1, "dag-proof-hash");

      await expect(() => escrow.connect(owner).release(1)).to.changeEtherBalances(
        [escrow, beneficiary],
        [ethers.parseEther("-1"), ethers.parseEther("1")],
      );

      const finalized = await escrow.getEscrow(1);
      expect(finalized.released).to.equal(true);
      expect(finalized.dagProofHash).to.equal("dag-proof-hash");
    });
  });

  describe("HakiToken", function () {
    it("mints tokens and logs provenance references", async function () {
      const [admin, recipient] = await ethers.getSigners();
      const tokenFactory = await ethers.getContractFactory("HakiToken");
      const token = await tokenFactory.deploy(admin.address);

      await token
        .connect(admin)
        .mintWithProvenance(
          recipient.address,
          ethers.parseUnits("1000", 18),
          "story-asset",
          "icp-canister",
          "dag-proof-hash",
          "workflow-tag",
        );

      const balance = await token.balanceOf(recipient.address);
      expect(balance).to.equal(ethers.parseUnits("1000", 18));

      const encoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ["string", "string", "string", "string"],
        ["workflow-tag", "story-asset", "icp-canister", "dag-proof-hash"],
      );
      const workflowId = ethers.keccak256(encoded);

      const provenance = await token.provenanceByWorkflow(workflowId);
      expect(provenance.storyAssetId).to.equal("story-asset");
      expect(provenance.icpCanisterId).to.equal("icp-canister");
      expect(provenance.dagProofHash).to.equal("dag-proof-hash");
      expect(provenance.mintedAmount).to.equal(ethers.parseUnits("1000", 18));
    });
  });
});

