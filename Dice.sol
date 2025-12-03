// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title DiceGame
 * @dev A provably fair dice betting game on Ethereum
 * @notice Players can deposit ETH, bet on dice rolls, and withdraw winnings
 */
contract DiceGame {
    // Mapping to store player balances
    mapping(address => uint256) public balances;
    
    // Events
    event DiceRolled(
        address indexed player,
        uint256 roll,
        bool win,
        uint256 betAmount,
        uint256 payout
    );
    event Deposit(address indexed player, uint256 amount);
    event Withdraw(address indexed player, uint256 amount);
    
    // Reentrancy guard
    bool private locked;
    
    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }
    
    /**
     * @dev Constructor - Initializes the contract with initial balance for deployer
     */
    constructor() {
        balances[msg.sender] = 1000 * 10**18;
    }
    
    /**
     * @dev Deposit ETH into the game
     * @notice Players must deposit ETH before they can bet
     */
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }
    
    /**
     * @dev Withdraw ETH from the game
     * @param amount The amount of ETH to withdraw (in wei)
     */
    function withdraw(uint256 amount) public nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(amount > 0, "Withdrawal amount must be greater than zero");
        
        balances[msg.sender] -= amount;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit Withdraw(msg.sender, amount);
    }
    
    /**
     * @dev Roll the dice and bet
     * @param betAmount The amount to bet (in wei)
     * @notice Roll 4, 5, or 6 to win 2x your bet
     */
    function rollDice(uint256 betAmount) public {
        require(balances[msg.sender] >= betAmount, "Insufficient balance");
        require(betAmount > 0, "Bet must be greater than zero");
        
        // Generate random number using blockhash and player address for better randomness
        // Note: For production, consider using Chainlink VRF for true randomness
        uint256 randomSeed = uint256(
            keccak256(
                abi.encodePacked(
                    blockhash(block.number - 1),
                    block.timestamp,
                    msg.sender,
                    block.coinbase,
                    tx.origin
                )
            )
        );
        
        uint256 roll = (randomSeed % 6) + 1;
        bool win = roll >= 4;
        
        balances[msg.sender] -= betAmount;
        
        uint256 payout = 0;
        if (win) {
            payout = betAmount * 2;
            balances[msg.sender] += payout;
        }
        
        emit DiceRolled(msg.sender, roll, win, betAmount, payout);
    }
    
    /**
     * @dev Get the balance of a player
     * @param player The address of the player
     * @return The balance of the player
     */
    function getBalance(address player) public view returns (uint256) {
        return balances[player];
    }
}
