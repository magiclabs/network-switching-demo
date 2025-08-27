"use client";

import { EVMExtension } from "@magic-ext/evm";
import { SolanaExtension } from "@magic-ext/solana";
import { Magic } from "magic-sdk";
import { useEffect, useMemo, useState } from "react";

const customPolygonOptions = {
  rpcUrl: "https://polygon-rpc.com/",
  chainId: 137,
  default: true, // Set as default network
};

const customOptimismOptions = {
  rpcUrl: "https://mainnet.optimism.io",
  chainId: 10,
};

export default function Home() {
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const magic = useMemo(
    () =>
      new Magic("pk_live_AE49DBEC9860ED1E", {
        extensions: [
          new EVMExtension([customOptimismOptions, customPolygonOptions]),
          new SolanaExtension({
            rpcUrl: "https://api.devnet.solana.com",
          }),
        ],
      }),
    []
  );

  useEffect(() => {
    magic.user.isLoggedIn().then((isLoggedIn) => {
      setIsLoggedIn(isLoggedIn);
    });
  }, []);

  const handleLogin = async () => {
    try {
      await magic.auth.loginWithEmailOTP({ email });
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await magic.user.logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetSolanaAddress = async () => {
    try {
      const solanaAddress = await magic.solana.getPublicAddress();
      alert(solanaAddress);
      console.log(solanaAddress);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-20">
      <h1 className="text-2xl font-bold">Magic Network Switching Demo</h1>
      {isLoggedIn ? (
        <div className="flex flex-col gap-2 w-[300px]">
          <button
            className="bg-blue-500 text-white rounded-md p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGetSolanaAddress}
          >
            Get Solana Address
          </button>
          <button
            className="bg-red-500 text-white rounded-md p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      ) : (
        <form
          className="flex flex-col gap-2 w-[300px]"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            className="border border-gray-300 rounded-md p-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white rounded-md p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={!email}
          >
            Login
          </button>
        </form>
      )}
    </div>
  );
}
