const { expect } = require("chai");
const { ethers } = require("hardhat");

// Mirror the Solidity enum
const State = {
  MANUFACTURED: 0,
  SHIPPED: 1,
  IN_CUSTOMS: 2,
  DELIVERED: 3,
  DISPUTED: 4,
  RESOLVED: 5,
};

describe("SupplyChain", function () {
  let supplyChain;
  let owner, shipper, customsOfficer, buyer, arbiter, other;

  beforeEach(async function () {
    [owner, shipper, customsOfficer, buyer, arbiter, other] =
      await ethers.getSigners();

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
  });

  async function createDefaultProduct() {
    const tx = await supplyChain
      .connect(owner)
      .createProduct(
        "Test Widget",
        shipper.address,
        customsOfficer.address,
        buyer.address,
        arbiter.address
      );
    await tx.wait();
    return 1; // first product id
  }

  // ─── 1. Deployment ─────────────────────────────────────────────────────────

  it("1. should start with productCount of 0", async function () {
    expect(await supplyChain.productCount()).to.equal(0);
  });

  // ─── 2. createProduct() ────────────────────────────────────────────────────

  it("2. should create a product and increment productCount", async function () {
    await createDefaultProduct();
    expect(await supplyChain.productCount()).to.equal(1);
  });

  it("3. should emit ProductCreated event on creation", async function () {
    await expect(
      supplyChain
        .connect(owner)
        .createProduct(
          "Test Widget",
          shipper.address,
          customsOfficer.address,
          buyer.address,
          arbiter.address
        )
    )
      .to.emit(supplyChain, "ProductCreated")
      .withArgs(1, "Test Widget", owner.address);
  });

  it("4. should store all roles correctly on creation", async function () {
    await createDefaultProduct();
    const product = await supplyChain.getProduct(1);
    expect(product.id).to.equal(1);
    expect(product.name).to.equal("Test Widget");
    expect(product.state).to.equal(State.MANUFACTURED);
    expect(product.manufacturer).to.equal(owner.address);
    expect(product.shipper).to.equal(shipper.address);
    expect(product.customsOfficer).to.equal(customsOfficer.address);
    expect(product.buyer).to.equal(buyer.address);
    expect(product.arbiter).to.equal(arbiter.address);
  });

  it("5. should revert when creating a product with an empty name", async function () {
    await expect(
      supplyChain
        .connect(owner)
        .createProduct(
          "",
          shipper.address,
          customsOfficer.address,
          buyer.address,
          arbiter.address
        )
    ).to.be.revertedWith("Name cannot be empty");
  });

  it("6. should revert when creating a product with a zero address role", async function () {
    await expect(
      supplyChain
        .connect(owner)
        .createProduct(
          "Widget",
          ethers.ZeroAddress,
          customsOfficer.address,
          buyer.address,
          arbiter.address
        )
    ).to.be.revertedWith("Shipper cannot be zero address");
  });

  it("7. should allow multiple products to be created", async function () {
    await createDefaultProduct();
    await supplyChain
      .connect(other)
      .createProduct(
        "Second Widget",
        shipper.address,
        customsOfficer.address,
        buyer.address,
        arbiter.address
      );
    expect(await supplyChain.productCount()).to.equal(2);
    const p2 = await supplyChain.getProduct(2);
    expect(p2.name).to.equal("Second Widget");
    expect(p2.manufacturer).to.equal(other.address);
  });

  // ─── 3. shipProduct() ──────────────────────────────────────────────────────

  it("8. should transition from MANUFACTURED to SHIPPED", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    const product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.SHIPPED);
  });

  it("9. should emit StateChanged event when shipping", async function () {
    await createDefaultProduct();
    await expect(supplyChain.connect(shipper).shipProduct(1))
      .to.emit(supplyChain, "StateChanged")
      .withArgs(1, State.MANUFACTURED, State.SHIPPED, shipper.address);
  });

  it("10. should revert shipProduct when called by non-shipper", async function () {
    await createDefaultProduct();
    await expect(
      supplyChain.connect(other).shipProduct(1)
    ).to.be.revertedWithCustomError(supplyChain, "Unauthorized");
  });

  it("11. should revert shipProduct when not in MANUFACTURED state", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await expect(
      supplyChain.connect(shipper).shipProduct(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  it("12. should revert shipProduct for a non-existent product", async function () {
    await expect(
      supplyChain.connect(shipper).shipProduct(99)
    ).to.be.revertedWithCustomError(supplyChain, "ProductDoesNotExist");
  });

  // ─── 4. clearCustoms() ─────────────────────────────────────────────────────

  it("13. should transition from SHIPPED to IN_CUSTOMS", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    const product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.IN_CUSTOMS);
  });

  it("14. should emit StateChanged event when clearing customs", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await expect(supplyChain.connect(customsOfficer).clearCustoms(1))
      .to.emit(supplyChain, "StateChanged")
      .withArgs(1, State.SHIPPED, State.IN_CUSTOMS, customsOfficer.address);
  });

  it("15. should revert clearCustoms when called by non-customsOfficer", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await expect(
      supplyChain.connect(other).clearCustoms(1)
    ).to.be.revertedWithCustomError(supplyChain, "Unauthorized");
  });

  it("16. should revert clearCustoms when not in SHIPPED state", async function () {
    await createDefaultProduct();
    await expect(
      supplyChain.connect(customsOfficer).clearCustoms(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  // ─── 5. confirmDelivery() ──────────────────────────────────────────────────

  it("17. should transition from IN_CUSTOMS to DELIVERED", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).confirmDelivery(1);
    const product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.DELIVERED);
  });

  it("18. should emit StateChanged event when confirming delivery", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await expect(supplyChain.connect(buyer).confirmDelivery(1))
      .to.emit(supplyChain, "StateChanged")
      .withArgs(1, State.IN_CUSTOMS, State.DELIVERED, buyer.address);
  });

  it("19. should revert confirmDelivery when called by non-buyer", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await expect(
      supplyChain.connect(other).confirmDelivery(1)
    ).to.be.revertedWithCustomError(supplyChain, "Unauthorized");
  });

  it("20. should revert confirmDelivery when not in IN_CUSTOMS state", async function () {
    await createDefaultProduct();
    await expect(
      supplyChain.connect(buyer).confirmDelivery(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  it("21. should revert if buyer tries to confirm delivery twice", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).confirmDelivery(1);
    await expect(
      supplyChain.connect(buyer).confirmDelivery(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  // ─── 6. raiseDispute() ─────────────────────────────────────────────────────

  it("22. should transition from IN_CUSTOMS to DISPUTED", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);
    const product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.DISPUTED);
  });

  it("23. should emit StateChanged event when raising dispute", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await expect(supplyChain.connect(buyer).raiseDispute(1))
      .to.emit(supplyChain, "StateChanged")
      .withArgs(1, State.IN_CUSTOMS, State.DISPUTED, buyer.address);
  });

  it("24. should revert raiseDispute when called by non-buyer", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await expect(
      supplyChain.connect(other).raiseDispute(1)
    ).to.be.revertedWithCustomError(supplyChain, "Unauthorized");
  });

  it("25. should revert raiseDispute when not in IN_CUSTOMS state", async function () {
    await createDefaultProduct();
    await expect(
      supplyChain.connect(buyer).raiseDispute(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  // ─── 7. resolveDispute() ───────────────────────────────────────────────────

  it("26. should transition from DISPUTED to RESOLVED", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);
    await supplyChain.connect(arbiter).resolveDispute(1);
    const product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.RESOLVED);
  });

  it("27. should emit StateChanged event when resolving dispute", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);
    await expect(supplyChain.connect(arbiter).resolveDispute(1))
      .to.emit(supplyChain, "StateChanged")
      .withArgs(1, State.DISPUTED, State.RESOLVED, arbiter.address);
  });

  it("28. should revert resolveDispute when called by non-arbiter", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);
    await expect(
      supplyChain.connect(other).resolveDispute(1)
    ).to.be.revertedWithCustomError(supplyChain, "Unauthorized");
  });

  it("29. should revert resolveDispute when not in DISPUTED state", async function () {
    await createDefaultProduct();
    await expect(
      supplyChain.connect(arbiter).resolveDispute(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  it("30. should revert if arbiter tries to resolve dispute twice", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);
    await supplyChain.connect(arbiter).resolveDispute(1);
    await expect(
      supplyChain.connect(arbiter).resolveDispute(1)
    ).to.be.revertedWithCustomError(supplyChain, "InvalidStateTransition");
  });

  // ─── 8. getProductState() ──────────────────────────────────────────────────

  it("31. getProductState returns correct string at every stage", async function () {
    await createDefaultProduct();
    expect(await supplyChain.getProductState(1)).to.equal("MANUFACTURED");
    await supplyChain.connect(shipper).shipProduct(1);
    expect(await supplyChain.getProductState(1)).to.equal("SHIPPED");
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    expect(await supplyChain.getProductState(1)).to.equal("IN_CUSTOMS");
    await supplyChain.connect(buyer).confirmDelivery(1);
    expect(await supplyChain.getProductState(1)).to.equal("DELIVERED");
  });

  it("32. getProductState returns DISPUTED and RESOLVED strings", async function () {
    await createDefaultProduct();
    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);
    expect(await supplyChain.getProductState(1)).to.equal("DISPUTED");
    await supplyChain.connect(arbiter).resolveDispute(1);
    expect(await supplyChain.getProductState(1)).to.equal("RESOLVED");
  });

  it("33. getProductState reverts for non-existent product", async function () {
    await expect(
      supplyChain.getProductState(999)
    ).to.be.revertedWithCustomError(supplyChain, "ProductDoesNotExist");
  });

  // ─── 9. Full lifecycle — happy path ────────────────────────────────────────

  it("34. full lifecycle: MANUFACTURED → DELIVERED", async function () {
    await createDefaultProduct();

    let product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.MANUFACTURED);

    await supplyChain.connect(shipper).shipProduct(1);
    product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.SHIPPED);

    await supplyChain.connect(customsOfficer).clearCustoms(1);
    product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.IN_CUSTOMS);

    await supplyChain.connect(buyer).confirmDelivery(1);
    product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.DELIVERED);
  });

  // ─── 10. Full lifecycle — dispute path ─────────────────────────────────────

  it("35. full lifecycle: MANUFACTURED → RESOLVED via dispute", async function () {
    await createDefaultProduct();

    await supplyChain.connect(shipper).shipProduct(1);
    await supplyChain.connect(customsOfficer).clearCustoms(1);
    await supplyChain.connect(buyer).raiseDispute(1);

    let product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.DISPUTED);

    await supplyChain.connect(arbiter).resolveDispute(1);
    product = await supplyChain.getProduct(1);
    expect(product.state).to.equal(State.RESOLVED);
  });
});
