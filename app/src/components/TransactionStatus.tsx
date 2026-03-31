interface TransactionStatusProps {
  hash: `0x${string}` | undefined;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export default function TransactionStatus({
  hash,
  isPending,
  isConfirming,
  isSuccess,
  error,
}: TransactionStatusProps) {
  if (!isPending && !isConfirming && !isSuccess && !error) return null;

  return (
    <div className="mt-4 animate-slideUp">
      {isPending && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-2 border border-zinc-800">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
          <span className="text-sm text-zinc-300">
            Waiting for wallet confirmation...
          </span>
        </div>
      )}

      {isConfirming && hash && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-2 border border-zinc-800">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
          <span className="text-sm text-zinc-300">
            Confirming on-chain...{" "}
            <span className="font-mono text-xs text-zinc-500 break-all">
              {hash.slice(0, 10)}...{hash.slice(-8)}
            </span>
          </span>
        </div>
      )}

      {isSuccess && hash && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-950 border border-brand-800">
          <span className="text-brand-400 text-lg leading-none mt-0.5">✓</span>
          <div>
            <p className="text-sm font-medium text-brand-300">
              Transaction confirmed
            </p>
            <a
              href={`https://rootstock-testnet.blockscout.com/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-brand-500 hover:text-brand-400 underline break-all mt-1 block"
            >
              View on Blockscout →
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-950 border border-red-800">
          <p className="text-sm font-medium text-red-300 mb-1">
            Transaction failed
          </p>
          <p className="text-xs text-red-400 font-mono break-all">
            {error.message.slice(0, 200)}
          </p>
        </div>
      )}
    </div>
  );
}
