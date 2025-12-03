import { ethers } from 'ethers';
import DiceGameABI from '../../artifacts/contracts/DiceGame.sol/DiceGame.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x2aF3733Be093331b70b4Ff07141C4F3FD3960b55";

/**
 * Connect to MetaMask wallet
 * @returns {Promise<Object|null>} Wallet connection object or null if failed
 */
export const connectWallet = async () => {
  try {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Use BrowserProvider for ethers v6 compatibility, fallback to Web3Provider for v5
      let provider;
      if (ethers.BrowserProvider) {
        provider = new ethers.BrowserProvider(window.ethereum);
      } else {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      }
      
      const signer = await provider.getSigner();
      const diceGameContract = new ethers.Contract(CONTRACT_ADDRESS, DiceGameABI.abi, signer);
      
      return {
        account: accounts[0],
        provider,
        signer,
        contract: diceGameContract
      };
    } else {
      throw new Error("MetaMask not detected. Please install MetaMask to use this app.");
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

/**
 * Deposit ETH into the game
 * @param {Object} contract - The contract instance
 * @param {number|string} amount - Amount in ETH (not wei)
 * @returns {Promise<boolean>} Success status
 */
export const depositETH = async (contract, amount) => {
  try {
    const parseEther = ethers.utils?.parseEther || ethers.parseEther;
    const amountWei = parseEther(amount.toString());
    const tx = await contract.deposit({ value: amountWei });
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error depositing ETH:", error);
    throw error;
  }
};

/**
 * Withdraw ETH from the game
 * @param {Object} contract - The contract instance
 * @param {number|string} amount - Amount in ETH (not wei)
 * @returns {Promise<boolean>} Success status
 */
export const withdrawETH = async (contract, amount) => {
  try {
    const parseEther = ethers.utils?.parseEther || ethers.parseEther;
    const amountWei = parseEther(amount.toString());
    const tx = await contract.withdraw(amountWei);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Error withdrawing ETH:", error);
    throw error;
  }
};

/**
 * Roll the dice with a bet
 * @param {Object} contract - The contract instance
 * @param {number|string} betAmount - Bet amount in ETH (not wei)
 * @returns {Promise<Object>} Transaction receipt
 */
export const rollDice = async (contract, betAmount) => {
  try {
    const parseEther = ethers.utils?.parseEther || ethers.parseEther;
    const betAmountWei = parseEther(betAmount.toString());
    const tx = await contract.rollDice(betAmountWei);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Error rolling dice:", error);
    throw error;
  }
};

/**
 * Get player balance
 * @param {Object} contract - The contract instance
 * @param {string} address - Player address
 * @returns {Promise<string>} Balance in ETH
 */
export const getBalance = async (contract, address) => {
  try {
    const balance = await contract.balances(address);
    const formatEther = ethers.utils?.formatEther || ethers.formatEther;
    return formatEther(balance);
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};