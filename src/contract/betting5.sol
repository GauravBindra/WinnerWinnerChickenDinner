// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./VRFConsumerBaseV2.sol"; // Ensure this is updated for VRF 2.5 compatibility
import "./VRFCoordinatorV2Interface.sol"; // Interface should be compatible with VRF 2.5

contract BettingGame is VRFConsumerBaseV2, ReentrancyGuard {
    IERC20 private LINK;
    VRFCoordinatorV2Interface private vrfCoordinator;

    uint256 private fee;
    uint256 public randomResult;
    uint256[] public randomResults; // To store multiple random results
    uint256 private subscriptionId;
    bytes32 private keyHash;
    uint32 private callbackGasLimit;

    address payable public admin;
    mapping(uint256 => Game) public games;
    uint256 public gameId;
    uint256 public lastGameId;

    address constant LINK_address = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;  // LINK token
    // LINK = IERC20(LINK_address);
    address constant VFRC_address = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
    // subscriptionId = 56320726399201691331904973166290281293821226043811703980205123577651804321058;
    // bytes32 s_keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    struct Game {
        uint256 id;
        uint256 bet;
        uint256 seed;
        uint256 amount;
        address payable player;
    }

    event GameResult(uint256 id, uint256 bet, uint256 seed, uint256 amount, address player, uint256 winAmount, uint256 randomResult);
    event Received(address indexed sender, uint256 amount);
    event Withdraw(address admin, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        uint256 _subscriptionId,
        bytes32 _keyHash,
        uint256 _callbackGasLimit
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        require(_vrfCoordinator != address(0), "Coordinator address cannot be zero");
        require(_linkToken != address(0), "LINK token address cannot be zero");

        admin = payable(msg.sender);
        vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        LINK = IERC20(_linkToken);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = uint32(_callbackGasLimit);
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function requestRandomNumber(uint256 userProvidedSeed) internal returns (uint256 requestId) {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        return vrfCoordinator.requestRandomWords(
            keyHash,
            subscriptionId,
            3, // Minimum request confirmations
            callbackGasLimit,
            1  // Number of random words
        );
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 randomness = randomWords[0];
        randomResults.push(randomness);
        randomResult = randomness;
        processResult(randomness);
    }

    function processResult(uint256 random) private {
        uint256 winAmount = 0;
        for (uint256 i = lastGameId; i < gameId; i++) {
            Game storage game = games[i];
            if ((random % 2 == 0 && game.bet == 1) || (random % 2 != 0 && game.bet == 0)) {
                winAmount = game.amount * 2;
                game.player.transfer(winAmount);
            }
            emit GameResult(game.id, game.bet, game.seed, game.amount, game.player, winAmount, random);
        }
        lastGameId = gameId; // Update the last processed game ID
    }

    function placeBet(uint256 bet, uint256 seed) public payable {
        require(msg.value >= 0.01 ether, "Minimum bet amount is 0.01 ETH");
        require(bet <= 1, "Bet must be either 0 or 1");

        games[gameId++] = Game(gameId, bet, seed, msg.value, payable(msg.sender));
        requestRandomNumber(seed);
    }

    function withdrawLink(uint256 amount) external onlyAdmin {
        require(LINK.transfer(msg.sender, amount), "Unable to transfer");
        emit Withdraw(msg.sender, amount);
    }

    function withdrawEther(uint256 amount) external onlyAdmin {
        require(address(this).balance >= amount, "Insufficient balance");
        admin.transfer(amount);
        emit Withdraw(msg.sender, amount);
    }
}
