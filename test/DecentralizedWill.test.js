const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedWill", function () {
  let decentralizedWill;
  let owner;
  let beneficiary;
  let otherAccount;
  const inactivityPeriod = 86400; // 1 day in seconds

  beforeEach(async function () {
    [owner, beneficiary, otherAccount] = await ethers.getSigners();
    const DecentralizedWillFactory = await ethers.getContractFactory(
      "DecentralizedWill"
    );
    decentralizedWill = await DecentralizedWillFactory.deploy();
    await decentralizedWill.waitForDeployment();
  });

  describe("Creating Wills", function () {
    it("should create a will with correct details", async function () {
      const amount = ethers.parseEther("1.0");
      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, inactivityPeriod, { value: amount });

      const wills = await decentralizedWill.getAllWills(owner.address);
      expect(wills.length).to.equal(1);
      expect(wills[0].beneficiary).to.equal(beneficiary.address);
      expect(wills[0].amount).to.equal(amount);
      expect(wills[0].claimed).to.equal(false);
      expect(wills[0].willId).to.equal(1);
    });

    it("should create multiple wills for the same owner", async function () {
      const amount1 = ethers.parseEther("1.0");
      const amount2 = ethers.parseEther("2.0");

      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, inactivityPeriod, { value: amount1 });

      await decentralizedWill
        .connect(owner)
        .setWill(otherAccount.address, inactivityPeriod * 2, {
          value: amount2,
        });

      const wills = await decentralizedWill.getAllWills(owner.address);
      expect(wills.length).to.equal(2);
      expect(wills[0].willId).to.equal(1);
      expect(wills[1].willId).to.equal(2);
      expect(wills[0].beneficiary).to.equal(beneficiary.address);
      expect(wills[1].beneficiary).to.equal(otherAccount.address);
    });

    it("should allow creating new wills after claiming", async function () {
      const amount = ethers.parseEther("1.0");
      const shortInactivity = 3600; // 1 hour

      // Create first will
      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, shortInactivity, { value: amount });

      // Fast forward time to make it claimable
      await ethers.provider.send("evm_increaseTime", [shortInactivity + 1]);
      await ethers.provider.send("evm_mine");

      // Claim the will
      await decentralizedWill.connect(beneficiary).claim(owner.address, 1);

      // Create another will (this should work now)
      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, inactivityPeriod, { value: amount });

      const wills = await decentralizedWill.getAllWills(owner.address);
      expect(wills.length).to.equal(2);
      expect(wills[0].claimed).to.equal(true);
      expect(wills[1].claimed).to.equal(false);
    });
  });

  describe("Claiming Functionality", function () {
    it("should not be claimable before inactivity period", async function () {
      const amount = ethers.parseEther("1.0");
      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, inactivityPeriod, { value: amount });

      const isClaimable = await decentralizedWill.isClaimable(owner.address, 1);
      expect(isClaimable).to.equal(false);
    });

    it("should be claimable after inactivity period", async function () {
      const amount = ethers.parseEther("1.0");
      const inactivityPeriod = 86400; // 1 day

      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, inactivityPeriod, { value: amount });

      // Fast forward time by more than the inactivity period
      await ethers.provider.send("evm_increaseTime", [inactivityPeriod + 1]);
      await ethers.provider.send("evm_mine");

      const isClaimable = await decentralizedWill.isClaimable(owner.address, 1);
      expect(isClaimable).to.equal(true);
    });
  });

  describe("Adding Funds", function () {
    it("should allow adding funds to existing will", async function () {
      const initialAmount = ethers.parseEther("1.0");
      const additionalAmount = ethers.parseEther("0.5");

      await decentralizedWill
        .connect(owner)
        .setWill(beneficiary.address, inactivityPeriod, {
          value: initialAmount,
        });

      await decentralizedWill
        .connect(owner)
        .addToWill(1, { value: additionalAmount });

      const wills = await decentralizedWill.getAllWills(owner.address);
      expect(wills[0].amount).to.equal(initialAmount + additionalAmount);
    });
  });
});
