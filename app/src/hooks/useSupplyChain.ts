import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS } from "../config/wagmi";
import SupplyChainABI from "../abi/SupplyChain.json";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Product = {
  id: bigint;
  name: string;
  state: number;
  manufacturer: `0x${string}`;
  shipper: `0x${string}`;
  customsOfficer: `0x${string}`;
  buyer: `0x${string}`;
  arbiter: `0x${string}`;
};

// ─── State Metadata ───────────────────────────────────────────────────────────

export const StateLabels: Record<number, string> = {
  0: "Manufactured",
  1: "Shipped",
  2: "In Customs",
  3: "Delivered",
  4: "Disputed",
  5: "Resolved",
};

export const StateColors: Record<number, string> = {
  0: "bg-zinc-700 text-zinc-200",
  1: "bg-blue-900 text-blue-300",
  2: "bg-yellow-900 text-yellow-300",
  3: "bg-brand-900 text-brand-300",
  4: "bg-red-900 text-red-300",
  5: "bg-purple-900 text-purple-300",
};

// ─── Read Hooks ───────────────────────────────────────────────────────────────

export function useProductCount() {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SupplyChainABI,
    functionName: "productCount",
  });
  return {
    ...result,
    data: result.data as bigint | undefined,
  };
}

export function useProduct(productId: bigint | undefined) {
  const result = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SupplyChainABI,
    functionName: "getProduct",
    args: productId !== undefined ? [productId] : undefined,
    query: {
      enabled: productId !== undefined && productId > 0n,
    },
  });
  return {
    ...result,
    data: result.data as Product | undefined,
  };
}

// ─── Write Hooks ──────────────────────────────────────────────────────────────

export function useCreateProduct() {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function create(
    name: string,
    shipper: `0x${string}`,
    customsOfficer: `0x${string}`,
    buyer: `0x${string}`,
    arbiter: `0x${string}`
  ) {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SupplyChainABI,
      functionName: "createProduct",
      args: [name, shipper, customsOfficer, buyer, arbiter],
    });
  }

  return {
    create,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError ?? receiptError,
    reset,
  };
}

export function useTransition(functionName: string) {
  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  function execute(productId: bigint) {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SupplyChainABI,
      functionName,
      args: [productId],
    });
  }

  return {
    execute,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: writeError ?? receiptError,
    reset,
  };
}
