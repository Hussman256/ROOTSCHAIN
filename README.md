# RootsChain

A role-based supply chain state machine built on Rootstock Testnet. RootsChain tracks products through a verifiable, tamper-proof on-chain lifecycle — enforcing strict rules about who can act, when they can act, and what state a product can move into next.

---

## What It Does

RootsChain allows a manufacturer to register a product on-chain and assign five role addresses: a shipper, a customs officer, a buyer, and an arbiter. Once created, the product moves through a fixed sequence of states. Each state transition is locked to the actor authorized for that step. No one can skip a state. No one can act outside their assigned role. Once a product is delivered or resolved, its lifecycle is permanently closed.

---

## Product Lifecycle

```
MANUFACTURED → SHIPPED → IN_CUSTOMS → DELIVERED
                                    ↘ DISPUTED → RESOLVED
```

| State | Triggered By | Description |
|---|---|---|
| `MANUFACTURED` | Manufacturer | Product registered on-chain |
| `SHIPPED` | Shipper | Shipper takes custody |
| `IN_CUSTOMS` | Customs Officer | Customs clears the item |
| `DELIVERED` | Buyer | Buyer confirms receipt |
| `DISPUTED` | Buyer | Buyer raises an issue |
| `RESOLVED` | Arbiter | Neutral party settles the dispute |

---

## Rules the Contract Enforces

**1. No state skipping.** A product must pass through every stage in order. The shipper cannot mark something delivered. The arbiter cannot act unless there is an active dispute.

**2. Role isolation.** Every function has a role-specific modifier. Calling `shipProduct()` from any address that is not the registered shipper reverts with a custom `Unauthorized` error.

**3. Final states are permanent.** Once a product reaches `DELIVERED` or `RESOLVED`, no further transitions are possible. Any attempt to call a transition function reverts with `InvalidStateTransition`.

**4. All decisions are on-chain.** There is no off-chain logic. Every state change emits a `StateChanged` event, creating an immutable activity log that any indexer or explorer can consume.

---

## Design Choices and Reasoning

**State machine over a simple tracker.** Most supply chain contracts store metadata and let anyone update it. RootsChain enforces the *order* of operations, not just the data. This makes the contract useful as a primitive — the behavior is the product, not the UI.

**Per-product role addresses.** Each product stores its own set of five role addresses rather than using a global role registry. This means different products can have completely different participants, which reflects how real supply chains work — a manufacturer may use different shippers for different shipments.

**Custom errors over require strings.** All access control and state guard failures use Solidity custom errors (`Unauthorized`, `InvalidStateTransition`, `ProductDoesNotExist`). These are more gas-efficient than string reverts and provide structured error data that the frontend can decode precisely.

**Buyer controls both terminal paths.** At the `IN_CUSTOMS` stage, the buyer has two choices: confirm delivery or raise a dispute. This is a deliberate design choice — the buyer is the party with the most information about whether the product arrived correctly, so they hold the decision. The arbiter only enters if the buyer signals a problem.

**Events as the audit log.** Every state change emits `StateChanged(productId, previousState, newState, triggeredBy)`. This means the entire lifecycle history of any product is queryable from the Rootstock Explorer without needing to store history in contract storage, keeping gas costs low.

---

## Tech Stack

**Smart Contract**
- Solidity 0.8.20
- Hardhat (compile, test, deploy)
- Deployed on Rootstock Testnet (Chain ID: 31)
- Verified on Rootstock Blockscout Explorer

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS (dark theme)
- React Router DOM v6
- Wagmi v2 + Viem v2
- WalletConnect + MetaMask
- @tanstack/react-query v5

---

## Project Structure

```
rootschain/
├── contracts/
│   └── SupplyChain.sol       # Core state machine contract
├── scripts/
│   └── deploy.js             # Deployment script
├── test/
│   └── SupplyChain.test.js   # 30-test suite
├── hardhat.config.js
├── .env.example
└── app/
    └── src/
        ├── config/wagmi.ts   # Chain + wallet config
        ├── hooks/            # Contract interaction hooks
        ├── components/       # Layout, ConnectButton, StateBadge
        └── pages/            # Home, Create, Track, Manage
```

---

## Setup and Installation

### Prerequisites
- Node.js v18+
- MetaMask or WalletConnect-compatible wallet
- tRBTC from the [Rootstock Testnet Faucet](https://faucet.rootstock.io/)
- Alchemy account with a Rootstock Testnet app

### 1. Clone the repo

```bash
git clone https://github.com/Hussman256/ROOTSCHAIN.git
cd ROOTSCHAIN
```

### 2. Install Hardhat dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in your `.env`:
```
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_RPC_URL=https://rootstock-testnet.g.alchemy.com/v2/your_key
```

### 4. Compile the contract

```bash
npx hardhat compile
```

### 5. Run the test suite

```bash
npx hardhat test
```

All 30 tests should pass covering: valid transitions, unauthorized reverts, invalid state reverts, event emissions, and full end-to-end lifecycle paths.

### 6. Deploy to Rootstock Testnet

```bash
npx hardhat run scripts/deploy.js --network rskTestnet
```

### 7. Verify on Rootstock Explorer

```bash
npx hardhat verify --network rskTestnet YOUR_CONTRACT_ADDRESS
```

---

## Running the Frontend

```bash
cd app
npm install
cp .env.example .env
```

Fill in `app/.env`:
```
VITE_ALCHEMY_RPC_URL=https://rootstock-testnet.g.alchemy.com/v2/your_key
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

---

## Contract Functions

| Function | Role | Required State |
|---|---|---|
| `createProduct(name, shipper, customsOfficer, buyer, arbiter)` | Anyone (becomes manufacturer) | — |
| `shipProduct(productId)` | Shipper | MANUFACTURED |
| `clearCustoms(productId)` | Customs Officer | SHIPPED |
| `confirmDelivery(productId)` | Buyer | IN_CUSTOMS |
| `raiseDispute(productId)` | Buyer | IN_CUSTOMS |
| `resolveDispute(productId)` | Arbiter | DISPUTED |
| `getProduct(productId)` | Anyone | — |
| `getProductState(productId)` | Anyone | — |

---

## Custom Errors

| Error | When |
|---|---|
| `Unauthorized(caller, expectedRole)` | Wrong actor calls a function |
| `InvalidStateTransition(productId, currentState)` | Function called in wrong state |
| `ProductDoesNotExist(productId)` | Product ID not found |

---

## Network Details

| Property | Value |
|---|---|
| Network | Rootstock Testnet |
| Chain ID | 31 |
| Currency | tRBTC |
| Explorer | https://rootstock-testnet.blockscout.com |
| Faucet | https://faucet.rootstock.io |

---

## License

MIT
