import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useProduct, useTransition, type Product } from "../hooks/useSupplyChain";
import StateBadge from "../components/StateBadge";
import TransactionStatus from "../components/TransactionStatus";

function detectRole(product: Product, address: string): string | null {
  const addr = address.toLowerCase();
  if (product.manufacturer.toLowerCase() === addr) return "Manufacturer";
  if (product.shipper.toLowerCase() === addr) return "Shipper";
  if (product.customsOfficer.toLowerCase() === addr) return "Customs Officer";
  if (product.buyer.toLowerCase() === addr) return "Buyer";
  if (product.arbiter.toLowerCase() === addr) return "Arbiter";
  return null;
}

export default function Manage() {
  const { address, isConnected } = useAccount();
  const [inputId, setInputId] = useState("");
  const [productId, setProductId] = useState<bigint | undefined>(undefined);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useProduct(productId);

  const ship = useTransition("shipProduct");
  const customs = useTransition("clearCustoms");
  const deliver = useTransition("confirmDelivery");
  const dispute = useTransition("raiseDispute");
  const resolve = useTransition("resolveDispute");

  // Auto-refetch 3s after any successful tx
  const anySuccess =
    ship.isSuccess ||
    customs.isSuccess ||
    deliver.isSuccess ||
    dispute.isSuccess ||
    resolve.isSuccess;

  useEffect(() => {
    if (!anySuccess) return;
    const timer = setTimeout(() => {
      void refetch();
    }, 3000);
    return () => clearTimeout(timer);
  }, [anySuccess, refetch]);

  function handleSearch() {
    const parsed = parseInt(inputId, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setProductId(BigInt(parsed));
      // reset all tx states when loading a new product
      ship.reset();
      customs.reset();
      deliver.reset();
      dispute.reset();
      resolve.reset();
    }
  }

  if (!isConnected) {
    return (
      <div className="animate-fadeIn max-w-lg">
        <div className="card text-center py-10">
          <p className="text-zinc-400 mb-4">
            Connect your wallet to manage products.
          </p>
        </div>
      </div>
    );
  }

  const userRole = product != null && address ? detectRole(product, address) : null;

  return (
    <div className="animate-fadeIn max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Product</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Search for a product and advance its state based on your assigned
          role.
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
          Load
        </button>
      </div>

      {isLoading && (
        <div className="card flex items-center gap-3">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm text-zinc-400">Loading...</span>
        </div>
      )}

      {error != null && (
        <div className="card border-red-800 bg-red-950">
          <p className="text-sm text-red-300">
            Product not found or an error occurred.
          </p>
        </div>
      )}

      {product != null && !isLoading && (
        <div className="space-y-4 animate-slideUp">
          {/* Product info */}
          <div className="card">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="label mb-1">Product #{product.id.toString()}</p>
                <h2 className="text-xl font-bold">{product.name}</h2>
              </div>
              <StateBadge state={product.state} />
            </div>

            {/* Role */}
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="label mb-1">Your Role</p>
              {userRole ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-brand-900 text-brand-300">
                  {userRole}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-zinc-800 text-zinc-400">
                  No role assigned
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="card space-y-4">
            <p className="label">Actions</p>

            {/* MANUFACTURED → ship */}
            {product.state === 0 && (
              <div>
                <button
                  className="btn-primary w-full"
                  disabled={ship.isPending || ship.isConfirming}
                  onClick={() => ship.execute(product.id)}
                >
                  {ship.isPending
                    ? "Confirm in wallet..."
                    : ship.isConfirming
                    ? "Confirming..."
                    : "Mark as Shipped"}
                </button>
                <TransactionStatus
                  hash={ship.hash}
                  isPending={ship.isPending}
                  isConfirming={ship.isConfirming}
                  isSuccess={ship.isSuccess}
                  error={ship.error}
                />
              </div>
            )}

            {/* SHIPPED → customs */}
            {product.state === 1 && (
              <div>
                <button
                  className="btn-primary w-full"
                  disabled={customs.isPending || customs.isConfirming}
                  onClick={() => customs.execute(product.id)}
                >
                  {customs.isPending
                    ? "Confirm in wallet..."
                    : customs.isConfirming
                    ? "Confirming..."
                    : "Clear Customs"}
                </button>
                <TransactionStatus
                  hash={customs.hash}
                  isPending={customs.isPending}
                  isConfirming={customs.isConfirming}
                  isSuccess={customs.isSuccess}
                  error={customs.error}
                />
              </div>
            )}

            {/* IN_CUSTOMS → deliver or dispute */}
            {product.state === 2 && (
              <div className="space-y-3">
                <div>
                  <button
                    className="btn-primary w-full"
                    disabled={deliver.isPending || deliver.isConfirming}
                    onClick={() => deliver.execute(product.id)}
                  >
                    {deliver.isPending
                      ? "Confirm in wallet..."
                      : deliver.isConfirming
                      ? "Confirming..."
                      : "Confirm Delivery"}
                  </button>
                  <TransactionStatus
                    hash={deliver.hash}
                    isPending={deliver.isPending}
                    isConfirming={deliver.isConfirming}
                    isSuccess={deliver.isSuccess}
                    error={deliver.error}
                  />
                </div>
                <div>
                  <button
                    className="btn-danger w-full"
                    disabled={dispute.isPending || dispute.isConfirming}
                    onClick={() => dispute.execute(product.id)}
                  >
                    {dispute.isPending
                      ? "Confirm in wallet..."
                      : dispute.isConfirming
                      ? "Confirming..."
                      : "Raise Dispute"}
                  </button>
                  <TransactionStatus
                    hash={dispute.hash}
                    isPending={dispute.isPending}
                    isConfirming={dispute.isConfirming}
                    isSuccess={dispute.isSuccess}
                    error={dispute.error}
                  />
                </div>
              </div>
            )}

            {/* DISPUTED → resolve */}
            {product.state === 4 && (
              <div>
                <button
                  className="btn-secondary w-full"
                  disabled={resolve.isPending || resolve.isConfirming}
                  onClick={() => resolve.execute(product.id)}
                >
                  {resolve.isPending
                    ? "Confirm in wallet..."
                    : resolve.isConfirming
                    ? "Confirming..."
                    : "Resolve Dispute"}
                </button>
                <TransactionStatus
                  hash={resolve.hash}
                  isPending={resolve.isPending}
                  isConfirming={resolve.isConfirming}
                  isSuccess={resolve.isSuccess}
                  error={resolve.error}
                />
              </div>
            )}

            {/* Terminal states */}
            {(product.state === 3 || product.state === 5) && (
              <div className="py-4 text-center">
                <span className="text-brand-500 text-2xl">✓</span>
                <p className="text-sm text-zinc-400 mt-2">
                  Lifecycle complete — no further actions available.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
