import { ethers } from "ethers";

class App {
  address: string = "";
  existWeb3: boolean = false;
  provider!: ethers.BrowserProvider;
  currentChainId: number = 0;
  constructor(address: string, balance: number) {
    this.address = address;

    //@ts-ignore
    if (typeof window.ethereum !== "undefined") {
      this.existWeb3 = true;
      // @ts-ignore
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async isConnected() {
    if (!this.existWeb3) return false;

    try {
      const accounts = await this.provider.listAccounts();
      return accounts.length > 0;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async connectWallet() {
    if (!this.existWeb3) return;

    try {
      const accounts = await this.provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      this.address = address;
      return address;
    } catch (error) {
      console.log("Error connecting wallet:", error);
      return;
    }
  }

  async getAddress() {
    if (!this.existWeb3) return;

    try {
      const signer = await this.provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.log("Error getting address:", error);
      return;
    }
  }

  async connectContract(address: string, abi: any) {
    if (!this.existWeb3) return;

    try {
      const signer = await this.provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    } catch (error) {
      console.log("Error connecting contract:", error);
      return;
    }
  }

  async contract(contractAddress: string, contractAbi: any) {
    if (!this.existWeb3 || !contractAddress || !contractAbi) {
      try {
        const contract = await this.connectContract(
          contractAddress,
          contractAbi
        );

        return contract;
      } catch (error) {
        console.log("Error connecting contract:", error);
      }
    }
  }

  async addTokenToMetamask(
    tokenName: string,
    tokenAddress: string,
    tokenSymbol: string,
    image: string,
    decimals: number
  ) {
    if (!this.existWeb3) return;

    try {
      this.provider.send("wallet_watchAsset", {
        type: "ERC20",
        options: {
          name: tokenName,
          address: tokenAddress,
          symbol: tokenSymbol,
          image,
          decimals,
        },
      });
    } catch (error) {
      console.error("Error adding token to Metamask:", error);
    }
  }

  async getTokenBalance(
    tokenAddress: string,
    tokenAbi: any
  ): Promise<string | boolean> {
    const isConnected = await this.isConnected();

    if (!this.existWeb3 || !tokenAddress || !tokenAbi || !isConnected)
      return false;

    try {
      const address = await this.getAddress();
      const contract = await this.connectContract(tokenAddress, tokenAbi);
      const balance = await contract?.balanceOf(address);
      const decimals = await contract?.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Error getting token balance:", error);
      return false;
    }
  }
}

const app = new App("", 0);
export default app;
