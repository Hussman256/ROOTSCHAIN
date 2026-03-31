// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SupplyChain {
    // ─── Enums ────────────────────────────────────────────────────────────────
    enum State {
        MANUFACTURED,
        SHIPPED,
        IN_CUSTOMS,
        DELIVERED,
        DISPUTED,
        RESOLVED
    }

    // ─── Structs ──────────────────────────────────────────────────────────────
    struct Product {
        uint256 id;
        string name;
        State state;
        address manufacturer;
        address shipper;
        address customsOfficer;
        address buyer;
        address arbiter;
    }

    // ─── Storage ──────────────────────────────────────────────────────────────
    uint256 public productCount;
    mapping(uint256 => Product) private products;

    // ─── Custom Errors ────────────────────────────────────────────────────────
    error Unauthorized(address caller, string expectedRole);
    error InvalidStateTransition(uint256 productId, State currentState);
    error ProductDoesNotExist(uint256 productId);

    // ─── Events ───────────────────────────────────────────────────────────────
    event ProductCreated(
        uint256 indexed productId,
        string name,
        address indexed manufacturer
    );
    event StateChanged(
        uint256 indexed productId,
        State previousState,
        State newState,
        address indexed triggeredBy
    );

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier productExists(uint256 productId) {
        if (productId == 0 || productId > productCount) {
            revert ProductDoesNotExist(productId);
        }
        _;
    }

    modifier onlyManufacturer(uint256 productId) {
        if (msg.sender != products[productId].manufacturer) {
            revert Unauthorized(msg.sender, "manufacturer");
        }
        _;
    }

    modifier onlyShipper(uint256 productId) {
        if (msg.sender != products[productId].shipper) {
            revert Unauthorized(msg.sender, "shipper");
        }
        _;
    }

    modifier onlyCustomsOfficer(uint256 productId) {
        if (msg.sender != products[productId].customsOfficer) {
            revert Unauthorized(msg.sender, "customsOfficer");
        }
        _;
    }

    modifier onlyBuyer(uint256 productId) {
        if (msg.sender != products[productId].buyer) {
            revert Unauthorized(msg.sender, "buyer");
        }
        _;
    }

    modifier onlyArbiter(uint256 productId) {
        if (msg.sender != products[productId].arbiter) {
            revert Unauthorized(msg.sender, "arbiter");
        }
        _;
    }

    modifier inState(uint256 productId, State expectedState) {
        if (products[productId].state != expectedState) {
            revert InvalidStateTransition(productId, products[productId].state);
        }
        _;
    }

    // ─── Write Functions ──────────────────────────────────────────────────────

    function createProduct(
        string calldata name,
        address shipper,
        address customsOfficer,
        address buyer,
        address arbiter
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(shipper != address(0), "Shipper cannot be zero address");
        require(customsOfficer != address(0), "CustomsOfficer cannot be zero address");
        require(buyer != address(0), "Buyer cannot be zero address");
        require(arbiter != address(0), "Arbiter cannot be zero address");

        productCount++;
        uint256 newId = productCount;

        products[newId] = Product({
            id: newId,
            name: name,
            state: State.MANUFACTURED,
            manufacturer: msg.sender,
            shipper: shipper,
            customsOfficer: customsOfficer,
            buyer: buyer,
            arbiter: arbiter
        });

        emit ProductCreated(newId, name, msg.sender);
        return newId;
    }

    function shipProduct(uint256 productId)
        external
        productExists(productId)
        onlyShipper(productId)
        inState(productId, State.MANUFACTURED)
    {
        State previous = products[productId].state;
        products[productId].state = State.SHIPPED;
        emit StateChanged(productId, previous, State.SHIPPED, msg.sender);
    }

    function clearCustoms(uint256 productId)
        external
        productExists(productId)
        onlyCustomsOfficer(productId)
        inState(productId, State.SHIPPED)
    {
        State previous = products[productId].state;
        products[productId].state = State.IN_CUSTOMS;
        emit StateChanged(productId, previous, State.IN_CUSTOMS, msg.sender);
    }

    function confirmDelivery(uint256 productId)
        external
        productExists(productId)
        onlyBuyer(productId)
        inState(productId, State.IN_CUSTOMS)
    {
        State previous = products[productId].state;
        products[productId].state = State.DELIVERED;
        emit StateChanged(productId, previous, State.DELIVERED, msg.sender);
    }

    function raiseDispute(uint256 productId)
        external
        productExists(productId)
        onlyBuyer(productId)
        inState(productId, State.IN_CUSTOMS)
    {
        State previous = products[productId].state;
        products[productId].state = State.DISPUTED;
        emit StateChanged(productId, previous, State.DISPUTED, msg.sender);
    }

    function resolveDispute(uint256 productId)
        external
        productExists(productId)
        onlyArbiter(productId)
        inState(productId, State.DISPUTED)
    {
        State previous = products[productId].state;
        products[productId].state = State.RESOLVED;
        emit StateChanged(productId, previous, State.RESOLVED, msg.sender);
    }

    // ─── View Functions ───────────────────────────────────────────────────────

    function getProduct(uint256 productId)
        external
        view
        productExists(productId)
        returns (Product memory)
    {
        return products[productId];
    }

    function getProductState(uint256 productId)
        external
        view
        productExists(productId)
        returns (string memory)
    {
        State s = products[productId].state;
        if (s == State.MANUFACTURED) return "MANUFACTURED";
        if (s == State.SHIPPED) return "SHIPPED";
        if (s == State.IN_CUSTOMS) return "IN_CUSTOMS";
        if (s == State.DELIVERED) return "DELIVERED";
        if (s == State.DISPUTED) return "DISPUTED";
        return "RESOLVED";
    }
}
