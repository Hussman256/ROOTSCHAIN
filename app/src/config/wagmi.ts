import { createConfig, http } from "wagmi";
import { defineChain } from "viem";
import { injected, walletConnect } from "wagmi/connectors";

export const rskTestnet = defineChain({
  id: 31,
  name: "Rootstock Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Test RBTC",
    symbol: "tRBTC",
  },
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_ALCHEMY_RPC_URL ||
          "https://public-node.testnet.rsk.co",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://rootstock-testnet.blockscout.com",
    },
  },
  testnet: true,
});

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "";

export const wagmiConfig = createConfig({
  chains: [rskTestnet],
  connectors: [
    injected(),
    walletConnect({ projectId: walletConnectProjectId }),
  ],
  transports: {
    [rskTestnet.id]: http(
      import.meta.env.VITE_ALCHEMY_RPC_URL ||
        "https://public-node.testnet.rsk.co"
    ),
  },
});

export const CONTRACT_ADDRESS = (
  import.meta.env.VITE_CONTRACT_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as `0x${string}`;
