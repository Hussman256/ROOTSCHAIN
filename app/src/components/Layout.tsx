import { NavLink, Outlet } from "react-router-dom";
import ConnectButton from "./ConnectButton";
import { CONTRACT_ADDRESS } from "../config/wagmi";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/create", label: "Create" },
  { to: "/track", label: "Track" },
  { to: "/manage", label: "Manage" },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface-0 text-zinc-100 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-surface-1 border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center">
              <span className="text-surface-0 font-bold text-sm font-mono">R</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">
              RootsChain
            </span>
          </div>

          {/* Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-surface-3 text-zinc-100"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-surface-2"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <ConnectButton />
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex items-center gap-1 px-4 pb-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `px-3 py-1 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-surface-3 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-surface-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-zinc-500">
            Rootstock Testnet · Chain ID 31
          </span>
          <a
            href={`https://rootstock-testnet.blockscout.com/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}
          </a>
        </div>
      </footer>
    </div>
  );
}
