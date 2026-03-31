import { useState } from "react";
import { useProduct, StateLabels } from "../hooks/useSupplyChain";
import StateBadge from "../components/StateBadge";

const PROGRESS_STATES = [0, 1, 2, 3]; // main happy path
const EXPLORER = "https://rootstock-testnet.blockscout.com/address/";

function AddressLink({ address }: { address: string }) {
  return (
    <a
      href={`${EXPLORER}${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-zinc-400 hover:text-brand-400 transition-colors break-all"
    >
      {address}
    </a>
  );
}

export default function TrackProduct() {
  const [inputId, setInputId] = useState("");
  const [productId, setProductId] = useState<bigint | undefined>(undefined);

  const { data: product, isLoading, error } = useProduct(productId);

  function handleSearch() {
    const parsed = parseInt(inputId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setProductId(BigInt(parsed));
    }
  }

  const progressIndex: number =
    product != null
      ? product.state <= 3
        ? product.state
        : 2 // dispute/resolved map visually to IN_CUSTOMS
      : -1;

  return (
    <div className="animate-fadeIn max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Track Product</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Enter a product ID to view its on-chain state and role addresses.
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <input
          className="input flex-1 font-mono"
          placeholder="Product ID (e.g. 1)"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          type="number"
          min="1"
        />
        <button onClick={handleSearch} className="btn-primary px-5">
          Search
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="card flex items-center gap-3">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm text-zinc-400">Loading...</span>
        </div>
      )}

      {/* Error */}
      {error != null && (
        <div className="card border-red-800 bg-red-950">
          <p className="text-sm text-red-300">
            Product not found or an error occurred.
          </p>
        </div>
      )}

      {/* Product card */}
      {product != null && !isLoading && (
        <div className="space-y-4 animate-slideUp">
          {/* Header */}
          <div className="card">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="label mb-1">Product #{product.id.toString()}</p>
                <h2 className="text-xl font-bold">{product.name}</h2>
              </div>
              <StateBadge state={product.state} />
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <p className="label mb-2">Lifecycle Progress</p>
              <div className="flex items-center gap-1">
                {PROGRESS_STATES.map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-1">
                    <div
                      className={`h-2 flex-1 rounded-full transition-colors ${
                        s <= progressIndex ? "bg-brand-500" : "bg-zinc-800"
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {PROGRESS_STATES.map((s) => (
                  <span
                    key={s}
                    className={`text-xs ${
                      s <= progressIndex ? "text-brand-600" : "text-zinc-600"
                    }`}
                  >
                    {StateLabels[s]}
                  </span>
                ))}
              </div>
            </div>

            {/* Dispute / Resolved notice */}
            {product.state === 4 && (
              <div className="mt-4 p-3 rounded-lg bg-red-950 border border-red-800">
                <p className="text-sm text-red-300 font-medium">
                  Dispute raised
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  Awaiting arbiter resolution.
                </p>
              </div>
            )}
            {product.state === 5 && (
              <div className="mt-4 p-3 rounded-lg bg-purple-950 border border-purple-800">
                <p className="text-sm text-purple-300 font-medium">
                  Dispute resolved
                </p>
                <p className="text-xs text-purple-400 mt-0.5">
                  The arbiter has closed this dispute.
                </p>
              </div>
            )}
          </div>

          {/* Role addresses */}
          <div className="card">
            <p className="label mb-4">Assigned Roles</p>
            <div className="divide-y divide-zinc-800">
              {(
                [
                  ["Manufacturer", product.manufacturer],
                  ["Shipper", product.shipper],
                  ["Customs Officer", product.customsOfficer],
                  ["Buyer", product.buyer],
                  ["Arbiter", product.arbiter],
                ] as [string, string][]
              ).map(([role, addr]) => (
                <div
                  key={role}
                  className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"
                >
                  <span className="label w-36 flex-shrink-0">{role}</span>
                  <AddressLink address={addr} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
