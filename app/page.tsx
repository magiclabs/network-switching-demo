"use client";

import { EVMExtension } from "@magic-ext/evm";
import { SolanaExtension } from "@magic-ext/solana";
import {
  InstanceWithExtensions,
  Magic,
  MagicSDKExtensionsOption,
  SDKBase,
} from "magic-sdk";
import { useEffect, useMemo, useState } from "react";
import { createWalletClient, custom, publicActions } from "viem";

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
  const [selectedChainId, setSelectedChainId] = useState<number>(1);
  const [magic, setMagic] = useState<InstanceWithExtensions<
    SDKBase,
    (EVMExtension | SolanaExtension)[]
  > | null>(null);

  useEffect(() => {
    setMagic(
      new Magic("pk_live_AE49DBEC9860ED1E", {
        extensions: [
          new EVMExtension([customOptimismOptions, customPolygonOptions]),
          new SolanaExtension({
            rpcUrl: "https://api.devnet.solana.com",
          }),
        ],
      })
    );
  }, []);

  const walletClient = useMemo(() => {
    if (!magic) return null;
    return createWalletClient({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      transport: custom(magic.rpcProvider as any),
    }).extend(publicActions);
  }, [magic]);

  useEffect(() => {
    if (!magic) return;
    magic.user.isLoggedIn().then((isLoggedIn) => {
      setIsLoggedIn(isLoggedIn);
    });
  }, [magic]);

  const handleLogin = async () => {
    try {
      if (!magic) return;
      await magic.auth.loginWithEmailOTP({ email });
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    if (!magic) return;
    const res = await magic.evm.switchEVMChain(chainId);
    alert(JSON.stringify(res));
    console.log(res);
  };

  const handleGetEthNetwork = async () => {
    if (!walletClient) return;
    const chainId = await walletClient.getChainId();
    alert(chainId);
    console.log(chainId);
  };

  const handleGetEthAddress = async () => {
    if (!walletClient) return;
    const [address] = await walletClient.getAddresses();
    alert(address);
    console.log(address);
  };

  const handleGetSolanaAddress = async () => {
    try {
      if (!magic) return;
      const solanaAddress = await magic.solana.getPublicAddress();
      alert(solanaAddress);
      console.log(solanaAddress);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      if (!magic) return;
      await magic.user.logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-20">
      <h1 className="text-2xl font-bold my-4">Magic Network Switching Demo</h1>
      {isLoggedIn ? (
        <div className="flex flex-col gap-2 w-[300px]">
          <div className="flex flex-col gap-2">
            <label htmlFor="chainSelect" className="text-sm font-medium">
              Select Network:
            </label>
            <select
              id="chainSelect"
              value={selectedChainId}
              onChange={(e) => setSelectedChainId(Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2"
            >
              <option value={1}>Ethereum Mainnet (1)</option>
              <option value={10}>Optimism (10)</option>
              <option value={137}>Polygon (137)</option>
            </select>
            <button
              className="bg-green-500 text-white rounded-md p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => handleSwitchNetwork(selectedChainId)}
            >
              Switch Network
            </button>
          </div>
          <button
            className="bg-blue-500 text-white rounded-md p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGetEthNetwork}
          >
            Get Eth Network
          </button>
          <button
            className="bg-blue-500 text-white rounded-md p-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleGetEthAddress}
          >
            Get Eth Address
          </button>
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
