# 🎲 BetProvably - Web3 Dice Betting Game

A decentralized, provably fair dice betting game built on the Ethereum blockchain. Players can deposit ETH, place bets on dice rolls, and withdraw their winnings securely through a smart contract.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.0-lightgrey.svg)
![React](https://img.shields.io/badge/React-19.0.0-blue.svg)

## ✨ Features

- **🎯 Provably Fair Gaming**: Transparent and verifiable randomness using blockchain technology
- **🔒 Secure Smart Contract**: Built with reentrancy protection and proper security measures
- **💼 Wallet Integration**: Seamless MetaMask integration for easy deposits and withdrawals
- **📊 Real-time Balance Tracking**: Monitor your balance and transaction history in real-time
- **🎨 Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **⚡ Fast Transactions**: Optimized gas usage for efficient blockchain interactions

## 🎮 How to Play

1. **Connect Your Wallet**: Click "Connect Wallet" and approve the MetaMask connection
2. **Deposit ETH**: Add ETH to your game balance using the deposit function
3. **Place Your Bet**: Enter your bet amount (minimum 0.01 ETH)
4. **Roll the Dice**: Click "Roll Dice" and wait for the result
5. **Win or Lose**: 
   - Roll **4, 5, or 6**: Win 2x your bet! 🎉
   - Roll **1, 2, or 3**: Lose your bet
6. **Withdraw**: Withdraw your winnings anytime

## 🏗️ Project Structure

```
BetProvably---Web3-Dice-Betting-Game/
├── Dice.sol                 # Smart contract source code
├── artifacts/               # Compiled contract artifacts
├── src/
│   ├── App.jsx             # Main application component
│   ├── Components/
│   │   └── Dice.jsx        # Dice component
│   ├── API/
│   │   └── gameAPI.js      # API utilities
│   ├── App.css             # Application styles
│   └── main.jsx            # Application entry point
├── public/                 # Static assets
├── package.json            # Dependencies
└── vite.config.js         # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Ethereum wallet** with test ETH (for testnet) or mainnet ETH

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/BetProvably---Web3-Dice-Betting-Game.git
   cd BetProvably---Web3-Dice-Betting-Game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   Create a `.env` file in the root directory:
   ```env
   VITE_CONTRACT_ADDRESS=0xYourContractAddress
   ```
   If not set, the app will use the default contract address.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## 📝 Smart Contract Details

### Contract Address
The contract address is configurable via environment variables. Default: `0x2aF3733Be093331b70b4Ff07141C4F3FD3960b55`

### Contract Functions

- **`deposit()`**: Deposit ETH into your game balance
- **`withdraw(uint256 amount)`**: Withdraw ETH from your game balance
- **`rollDice(uint256 betAmount)`**: Place a bet and roll the dice
- **`getBalance(address player)`**: Get the balance of a specific player
- **`balances(address)`**: Public mapping to check any player's balance

### Events

- **`DiceRolled`**: Emitted when a dice roll occurs
  - `player`: Address of the player
  - `roll`: The dice result (1-6)
  - `win`: Whether the player won
  - `betAmount`: Amount bet
  - `payout`: Amount won (0 if lost)

- **`Deposit`**: Emitted when a deposit is made
- **`Withdraw`**: Emitted when a withdrawal is made

### Security Features

- ✅ Reentrancy protection using `nonReentrant` modifier
- ✅ Input validation for all functions
- ✅ Safe ETH transfers using `call()` instead of `transfer()`
- ✅ Enhanced randomness using multiple block parameters

## 🛠️ Technology Stack

### Frontend
- **React 19.0.0** - UI framework
- **Vite 6.2.0** - Build tool and dev server
- **Tailwind CSS 4.0.9** - Styling
- **Ethers.js 5.7.2** - Ethereum interaction library

### Smart Contract
- **Solidity ^0.8.0** - Smart contract language
- **Hardhat** - Development environment (for compilation)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Compiling the Smart Contract

If you need to recompile the contract:

```bash
# Install Hardhat (if not already installed)
npm install --save-dev hardhat

# Compile the contract
npx hardhat compile
```

## 🧪 Testing

Before deploying to mainnet, always test on a testnet:

1. **Deploy to Sepolia/Goerli testnet**
2. **Get test ETH** from a faucet
3. **Test all functions** thoroughly
4. **Verify contract** on Etherscan

## ⚠️ Important Notes

- **This is a gambling application**. Please gamble responsibly and only with funds you can afford to lose.
- **Smart contract is immutable** once deployed. Always audit contracts before mainnet deployment.
- **Gas fees apply** to all transactions on Ethereum.
- **Test thoroughly** on testnets before using real funds.

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📞 Contact

For questions, support, or collaboration opportunities:

**Telegram**: [t.me/moooncity](https://t.me/moooncity)

---

**Disclaimer**: This software is provided "as is" without warranty. Use at your own risk. The developers are not responsible for any financial losses incurred while using this application.

