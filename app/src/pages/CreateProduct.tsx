import { useState, type FormEvent } from "react";
import { useAccount } from "wagmi";
import { useCreateProduct } from "../hooks/useSupplyChain";
import TransactionStatus from "../components/TransactionStatus";

function isAddress(value: string): value is `0x${string}` {
  return /^0x[0-9a-fA-F]{40}$/.test(value);
}

export default function CreateProduct() {
  const { isConnected } = useAccount();
  const { create, hash, isPending, isConfirming, isSuccess, error, reset } =
    useCreateProduct();

  const [name, setName] = useState("");
  const [shipper, setShipper] = useState("");
  const [customsOfficer, setCustomsOfficer] = useState("");
  const [buyer, setBuyer] = useState("");
  const [arbiter, setArbiter] = useState("");

  const isValid =
    name.trim().length > 0 &&
    isAddress(shipper) &&
    isAddress(customsOfficer) &&
    isAddress(buyer) &&
    isAddress(arbiter);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    create(
      name.trim(),
      shipper as `0x${string}`,
      customsOfficer as `0x${string}`,
      buyer as `0x${string}`,
      arbiter as `0x${string}`
    );
  }

  function handleReset() {
    setName("");
    setShipper("");
    setCustomsOfficer("");
    setBuyer("");
    setArbiter("");
    reset();
  }

  if (!isConnected) {
    return (
      <div className="animate-fadeIn max-w-lg">
        <div className="card text-center py-10">
          <p className="text-zinc-400 mb-4">
            Connect your wallet to create a product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Register a new product on-chain and assign all required roles.
        </p>
      </div>

      {isSuccess ? (
        <div className="card animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-brand-900 flex items-center justify-center text-brand-400 text-lg">
              ✓
            </span>
            <div>
              <p className="font-semibold text-brand-300">Product created!</p>
              <p className="text-xs text-zinc-500">Transaction confirmed</p>
            </div>
          </div>
          <TransactionStatus
            hash={hash}
            isPending={false}
            isConfirming={false}
            isSuccess={isSuccess}
            error={null}
          />
          <p className="text-sm text-zinc-400 mt-4">
            Next: head to{" "}
            <a href="/track" className="text-brand-500 hover:underline">
              Track
            </a>{" "}
            to view the product, or{" "}
            <a href="/manage" className="text-brand-500 hover:underline">
              Manage
            </a>{" "}
            to advance its state.
          </p>
          <button onClick={handleReset} className="btn-secondary mt-4">
            Create another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="label block mb-1.5">Product Name</label>
            <input
              className="input w-full"
              placeholder="e.g. Organic Coffee Beans — Batch #1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending || isConfirming}
            />
          </div>

          {(
            [
              ["Shipper Address", shipper, setShipper],
              ["Customs Officer Address", customsOfficer, setCustomsOfficer],
              ["Buyer Address", buyer, setBuyer],
              ["Arbiter Address", arbiter, setArbiter],
            ] as [string, string, (v: string) => void][]
          ).map(([label, value, setter]) => (
            <div key={label}>
              <label className="label block mb-1.5">{label}</label>
              <input
                className={`input w-full font-mono text-sm ${
                  value && !isAddress(value) ? "border-red-700" : ""
                }`}
                placeholder="0x..."
                value={value}
                onChange={(e) => setter(e.target.value)}
                disabled={isPending || isConfirming}
              />
              {value && !isAddress(value) && (
                <p className="text-xs text-red-400 mt-1">
                  Invalid address format
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!isValid || isPending || isConfirming}
          >
            {isPending
              ? "Confirm in wallet..."
              : isConfirming
              ? "Confirming..."
              : "Create Product"}
          </button>

          <TransactionStatus
            hash={hash}
            isPending={isPending}
            isConfirming={isConfirming}
            isSuccess={isSuccess}
            error={error}
          />
        </form>
      )}
    </div>
  );
}
