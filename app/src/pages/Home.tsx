import { Link } from "react-router-dom";
import { useProductCount } from "../hooks/useSupplyChain";
import { CONTRACT_ADDRESS } from "../config/wagmi";

const lifecycle = [
  { state: "Manufactured", color: "bg-zinc-600", actor: "Manufacturer" },
  { state: "Shipped", color: "bg-blue-600", actor: "Shipper" },
  { state: "In Customs", color: "bg-yellow-600", actor: "Customs Officer" },
  { state: "Delivered", color: "bg-brand-500", actor: "Buyer" },
  { state: "Disputed", color: "bg-red-600", actor: "Buyer" },
  { state: "Resolved", color: "bg-purple-600", actor: "Arbiter" },
];

export default function Home() {
  const { data: productCount } = useProductCount();

  return (
    <div className="animate-fadeIn space-y-10">
      {/* Live badge */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulseSoft" />
        <span className="text-xs font-mono text-brand-500">
          Live on Rootstock Testnet
        </span>
      </div>

      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Supply chain state machine
          <br />
          <span className="text-brand-500">on-chain.</span>
        </h1>
        <p className="text-zinc-400 max-w-lg leading-relaxed">
          Every product transition is locked to an authorized actor. No state
          can be skipped. No actor can act outside their role. Fully transparent
          on Rootstock.
        </p>
        <div className="flex items-center gap-3 pt-2">
          <Link to="/create" className="btn-primary">
            Create Product
          </Link>
          <Link to="/track" className="btn-secondary">
            Track Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="label mb-2">Total Products</p>
          <p className="text-3xl font-bold font-mono text-brand-400">
            {productCount != null ? productCount.toString() : "—"}
          </p>
        </div>
        <div className="card">
          <p className="label mb-2">Network</p>
          <p className="text-lg font-semibold text-zinc-200">
            Rootstock Testnet
          </p>
          <p className="text-sm font-mono text-zinc-500 mt-0.5">
            Chain ID: 31
          </p>
        </div>
        <div className="card">
          <p className="label mb-2">Contract</p>
          <p className="text-sm font-mono text-zinc-400 break-all">
            {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
          </p>
          <a
            href={`https://rootstock-testnet.blockscout.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:text-brand-500 mt-1 block"
          >
            View on Blockscout →
          </a>
        </div>
      </div>

      {/* Lifecycle diagram */}
      <div className="card">
        <p className="label mb-6">Product Lifecycle</p>
        <div className="relative">
          {/* Horizontal line */}
          <div className="hidden sm:block absolute top-3 left-0 right-0 h-px bg-zinc-800" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-2">
            {lifecycle.map((step, i) => (
              <div
                key={step.state}
                className="flex flex-col items-center gap-2 relative"
              >
                <div
                  className={`w-6 h-6 rounded-full ${step.color} z-10 flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-xs font-bold">{i}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-zinc-300">
                    {step.state}
                  </p>
                  <p className="text-xs text-zinc-600 mt-0.5">{step.actor}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dispute branch note */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600 mt-1 flex-shrink-0" />
            <p className="text-xs text-zinc-500">
              State 4 (Disputed) and State 5 (Resolved) form an alternate branch
              from In Customs — the buyer can raise a dispute instead of
              confirming delivery, which an arbiter then resolves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
