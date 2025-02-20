export const tokens = [
  {
    address: "0xB57B60DeBDB0b8172bb6316a9164bd3C695F133a",
    name: "AVAX (DFK Chain)",
    key: 1,
    image: "/images/avalanche_logo.png", 
  },

  {
    address: "0x04b9dA42306B023f3572e106B11D82aAd9D32EBb",
    name: "CRYSTAL",
    key: 2,
    image: "/images/crystal_logo.png",
  },
  {
    address: "0x576C260513204392F0eC0bc865450872025CB1cA",
    name: "DFKGOLD",
    key: 3,
    image: "/images/dfkgold.png", 
  },
];

export const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

export const AVALANCHE_MAINNET_PARAMS = {
  chainId: "0xA86A",
  chainName: "Avalanche C-Chain",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://snowtrace.io/"],
};

export const VARIABLES = {
  OBJECT: "object",
  STRING: "string",
};

export const ROLES = {
  USER: "user",
  AGENT: "agent",
};

export const USER_ACTIVITY_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "action", label: "Action" },
  { key: "ip_address", label: "IP Address" },
  { key: "transaction_hash", label: "Transaction Hash" },
  { key: "createdAt", label: "Created At" },
];

export const truncateAddress = (address: string) => {
  if (!address) return "Connect Wallet";
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
};

export const NONE = 'NONE';
export const COMPLETED = 'COMPLETED';
export const CANCELED = 'CANCELED';
export const  STARTED = 'STARTED';