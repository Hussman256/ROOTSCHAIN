import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { wagmiConfig } from "./config/wagmi";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import CreateProduct from "./pages/CreateProduct";
import TrackProduct from "./pages/TrackProduct";
import Manage from "./pages/Manage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateProduct />} />
              <Route path="/track" element={<TrackProduct />} />
              <Route path="/manage" element={<Manage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
