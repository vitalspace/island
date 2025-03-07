import erc20Abi from "../ABI/erc20Abi.json";

export const API_URL = "http://localhost:4000/v2/";
export const WS = "ws://localhost:4000/v2/ws";
export const ERC20_ADDRESS = "0x6659C771d515cB955bC5103b877A2E8DAA065780";
export const ERC721_ADDRESS = "0x7288e0a58D5df6264a8444A0284cD311377Ad26C";
export const MARKET_ADDRESS = "0xDF803e4C1534F01e0b811e8F13f367f4a41A0cBA";

export const TOKEN_INFO = {
  name: "Island v1",
  address: ERC20_ADDRESS,
  symbol: "ISLV",
  image: "",
  decimals: 18,
  abi: erc20Abi,
};
