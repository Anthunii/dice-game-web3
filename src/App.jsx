import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Smart contract ABI & address details
import DiceGameABI from '../artifacts/contracts/DiceGame.sol/DiceGame.json';

// Contract address - should be set via environment variable in production
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x2aF3733Be093331b70b4Ff07141C4F3FD3960b55";

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(100);
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState(null);
  const [resultMessage, setResultMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [depositAmount, setDepositAmount] = useState(0.1);
  const [withdrawAmount, setWithdrawAmount] = useState(0.1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const diceRef = useRef(null);

  const connectWallet = async () => {
    try {
      setError('');
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
        
        setAccount(accounts[0]);
        setProvider(provider);
        setSigner(signer);
        setContract(diceGameContract);

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            setAccount(null);
            setContract(null);
          }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      } else {
        setError("MetaMask not detected. Please install MetaMask to use this app.");
        alert("MetaMask not detected. Please install MetaMask to use this app.");
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      setError(error.message || "Failed to connect wallet");
    }
  };

  const fetchBalance = async () => {
    if (contract && account) {
      try {
        const userBalance = await contract.balances(account);
        // Handle both ethers v5 and v6
        const formattedBalance = ethers.utils 
          ? ethers.utils.formatEther(userBalance)
          : ethers.formatEther(userBalance);
        setBalance(formattedBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setError("Failed to fetch balance");
      }
    }
  };

  const depositETH = async () => {
    if (contract && signer && depositAmount > 0) {
      try {
        setLoading(true);
        setError('');
        
        const parseEther = ethers.utils?.parseEther || ethers.parseEther;
        const amount = parseEther(depositAmount.toString());
        const tx = await contract.deposit({ value: amount });
        await tx.wait();
        
        await fetchBalance();
        
        setTransactions([{
          type: 'Deposit',
          amount: `${depositAmount} ETH`,
          timestamp: new Date().toLocaleString()
        }, ...transactions]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error depositing ETH:", error);
        setError(error.message || "Failed to deposit ETH");
        setLoading(false);
      }
    }
  };

  // Withdraw ETH from contract
  const withdrawETH = async () => {
    if (contract && signer && withdrawAmount > 0) {
      try {
        setLoading(true);
        setError('');
        
        const parseEther = ethers.utils?.parseEther || ethers.parseEther;
        const amount = parseEther(withdrawAmount.toString());
        const tx = await contract.withdraw(amount);
        await tx.wait();
        
        await fetchBalance();
        
        setTransactions([{
          type: 'Withdraw',
          amount: `${withdrawAmount} ETH`,
          timestamp: new Date().toLocaleString()
        }, ...transactions]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error withdrawing ETH:", error);
        setError(error.message || "Failed to withdraw ETH");
        setLoading(false);
      }
    }
  };

  const rollDice = async () => {
    if (contract && signer && betAmount > 0 && parseFloat(balance) >= betAmount) {
      try {
        setIsRolling(true);
        setResultMessage('');
        setError('');
        
        // Handle dice animation
        if (diceRef.current) {
          diceRef.current.style.animation = 'rolling 2s';
          setTimeout(() => {
            if (diceRef.current) {
              diceRef.current.style.animation = '';
            }
          }, 2000);
        }

        const parseEther = ethers.utils?.parseEther || ethers.parseEther;
        const betAmountWei = parseEther(betAmount.toString());
        
        // Estimate gas and add buffer
        let tx;
        try {
          const gasEstimate = await contract.estimateGas.rollDice(betAmountWei);
          // Add 30% buffer for gas limit
          const gasLimit = gasEstimate.mul ? gasEstimate.mul(130).div(100) : gasEstimate * 1.3n;
          tx = await contract.rollDice(betAmountWei, { gasLimit });
        } catch (gasError) {
          // If gas estimation fails, try without custom gas limit
          tx = await contract.rollDice(betAmountWei);
        }
        
        // Listen for the event
        contract.once("DiceRolled", (player, roll, win, betAmountEvent, payout) => {
          const rollValue = typeof roll === 'bigint' ? Number(roll) : roll.toNumber();
          setDiceResult(rollValue);
          
          const winOrLose = win ? "Won" : "Lost";
          const formatEther = ethers.utils?.formatEther || ethers.formatEther;
          const payoutAmount = formatEther(payout);
          const amountChange = win ? `+${payoutAmount} ETH` : `-${betAmount} ETH`;
          
          setResultMessage(win ? 
            `You rolled a ${rollValue} and won ${payoutAmount} ETH!` : 
            `You rolled a ${rollValue} and lost ${betAmount} ETH.`
          );
          
          setTransactions([{
            type: 'Bet',
            roll: rollValue,
            result: winOrLose,
            amount: amountChange,
            timestamp: new Date().toLocaleString()
          }, ...transactions]);
          
          setIsRolling(false);
          fetchBalance();
        });
        
        await tx.wait();
      } catch (error) {
        console.error("Error rolling dice:", error);
        setIsRolling(false);
        setError(error.message || "Transaction failed. Please try again.");
        setResultMessage("Transaction failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchBalance();

      // Set up event listener for the contract
      const diceRolledFilter = contract.filters.DiceRolled(account);
      contract.on(diceRolledFilter, (player, roll, win) => {
        fetchBalance();
      });

      return () => {
        contract.removeAllListeners();
      };
    }
  }, [contract, account]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-purple-500 mb-2">BetProvably</h1>
          <p className="text-gray-400">Roll 4, 5, or 6 to double your bet!</p>
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {!account ? (
          <div className="text-center my-12">
            <button
              onClick={connectWallet}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105"
            >
              Connect Wallet
            </button>
            <p className="mt-4 text-gray-400">Connect your MetaMask wallet to start playing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Your Balance</h2>
                  <p className="text-2xl font-bold text-green-400">{parseFloat(balance).toFixed(4)} ETH</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-gray-700 text-white py-2 px-3 rounded-lg text-sm"
                      disabled={loading}
                    />
                    <button
                      onClick={depositETH}
                      disabled={loading || depositAmount <= 0}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm"
                    >
                      Deposit
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
                      className="w-24 bg-gray-700 text-white py-2 px-3 rounded-lg text-sm"
                      disabled={loading}
                    />
                    <button
                      onClick={withdrawETH}
                      disabled={loading || withdrawAmount <= 0}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg text-sm"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center py-8">
                {/* Dice */}
                <div 
                  ref={diceRef}
                  className={`dice mb-8 ${isRolling ? 'rolling' : ''}`}
                >
                  {diceResult ? (
                    <div className={`dice-face dice-${diceResult}`}>
                      {[...Array(diceResult)].map((_, i) => (
                        <div key={i} className="dot"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="dice-face dice-6">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  )}
                </div>
                
                {resultMessage && (
                  <div className={`text-center mb-6 text-xl ${
                    resultMessage.includes('won') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {resultMessage}
                  </div>
                )}
                
                <div className="w-full max-w-md">
                  <div className="mb-4">
                    <label className="block text-gray-400 mb-2">Bet Amount (ETH)</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                      className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg"
                      disabled={isRolling}
                    />
                  </div>
                  
                  <button
                    onClick={rollDice}
                    disabled={isRolling || parseFloat(balance) < betAmount || betAmount <= 0}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition transform hover:scale-105 ${
                      isRolling || parseFloat(balance) < betAmount || betAmount <= 0
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 shadow-lg'
                    }`}
                  >
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                  </button>
                  {parseFloat(balance) < betAmount && betAmount > 0 && (
                    <p className="text-red-400 text-sm mt-2 text-center">
                      Insufficient balance. Please deposit more ETH.
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              {transactions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map((tx, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span className="font-medium">{tx.type}</span>
                        <span className={tx.type === 'Bet' && tx.result === 'Won' ? 'text-green-400' :
                          tx.type === 'Bet' && tx.result === 'Lost' ? 'text-red-400' :
                          tx.type === 'Deposit' ? 'text-green-400' : 'text-red-400'}>
                          {tx.amount}
                        </span>
                      </div>
                      {tx.type === 'Bet' && (
                        <div className="text-sm text-gray-400 mt-1">
                          Rolled: {tx.roll} - {tx.result}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">{tx.timestamp}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No transactions yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;