import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { walletConnectProjectId } from "../config/wagmi";

export default function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const isCorrectNetwork = chainId === 31;

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectNetwork ? (
          <span className="px-2 py-1 rounded-md bg-red-900 text-red-300 text-xs font-mono">
            Wrong Network
          </span>
        ) : (
          <span className="px-2 py-1 rounded-md bg-brand-900 text-brand-400 text-xs font-mono">
            RSK Testnet
          </span>
        )}
        <span className="text-sm font-mono text-zinc-400 hidden sm:block">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const metamask = connectors.find((c) => c.id === "injected");
  const wc = connectors.find((c) => c.id === "walletConnect");

  return (
    <div className="flex items-center gap-2">
      {metamask && (
        <button
          onClick={() => connect({ connector: metamask })}
          className="btn-primary text-xs px-3 py-1.5"
        >
          MetaMask
        </button>
      )}
      {wc && walletConnectProjectId && (
        <button
          onClick={() => connect({ connector: wc })}
          disabled={isPending}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
        >
          {isPending ? "Connecting..." : "WalletConnect"}
        </button>
      )}
    </div>
  );
}
