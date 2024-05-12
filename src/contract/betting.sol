// SPDX-License-Identifier: MIT
pragma solidity 0.8.25;

// Import the IERC20 interface and ReentrancyGuard from OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract BettingGame is VRFConsumerBaseV2, ReentrancyGuard {
    IERC20 private LINK;  // Define LINK as an IERC20 token
    AggregatorV3Interface internal ethUsd;

    uint256 internal fee;
    uint256 public randomResult;
    uint256 public gameId;
    uint256 public lastGameId;
    address payable public admin;

    // Network: Rinkeby
    address constant VFRC_address = 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B;  // VRF Coordinator
    address constant LINK_address = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;  // LINK token

    // Declaring 50% chance, (0.5 * (uint256 + 1))
    uint256 constant half = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

    // KeyHash - one of the component from which will be generated final random value by Chainlink VFRC.
    bytes32 constant internal keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;

    struct Game {
        uint256 id;
        uint256 bet;
        uint256 seed;
        uint256 amount;
        address payable player;
    }
    mapping(uint256 => Game) public games;

    event Withdraw(address admin, uint256 amount);
    event Received(address indexed sender, uint256 amount);
    event Result(uint256 id, uint256 bet, uint256 randomSeed, uint256 amount, address player, uint256 winAmount, uint256 randomResult, uint256 time);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Caller is not the admin");
        _;
    }

    modifier onlyVFRC() {
        require(msg.sender == VFRC_address, "Only VFRC can call this function");
        _;
    }

    constructor() VRFConsumerBaseV2(VFRC_address, LINK_address) {
        admin = payable(msg.sender);
        LINK = IERC20(LINK_address);
        fee = 0.1 * 10 ** 18;  // 0.1 LINK

        ethUsd = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function ethInUsd() public view returns (int) {
        (, int price,,,) = ethUsd.latestRoundData();
        return price;
    }

    function weiInUsd() public view returns (uint) {
        int ethUsdPrice = ethInUsd();
        require(ethUsdPrice > 0, "ETH/USD price is non-positive");
        uint weiUsd = 10**26 / uint(ethUsdPrice);
        return weiUsd;
    }

    function game(uint256 bet, uint256 seed) public payable returns (bool) {
        uint weiUsd = weiInUsd();
        require(msg.value >= weiUsd, "Error, msg.value must be >= $1");
        require(bet <= 1, "Error, accept only 0 and 1");
        require(address(this).balance >= msg.value, "Error, insufficient vault balance");

        games[gameId] = Game(gameId, bet, seed, msg.value, payable(msg.sender));
        gameId++;

        getRandomNumber(seed);
        return true;
    }

    function getRandomNumber(uint256 userProvidedSeed) internal returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) > fee, "Error, not enough LINK - fill contract with faucet");
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
        verdict(randomness);
    }

    function verdict(uint256 random) public payable onlyVFRC {
        for (uint256 i = lastGameId; i < gameId; i++) {
            uint256 winAmount = 0;
            if ((random >= half && games[i].bet == 1) || (random < half && games[i].bet == 0)) {
                winAmount = games[i].amount * 2;
                games[i].player.transfer(winAmount);
            }
            emit Result(games[i].id, games[i].bet, games[i].seed, games[i].amount, games[i].player, winAmount, random, block.timestamp);
        }
        lastGameId = gameId;
    }

    function withdrawLink(uint256 amount) external onlyAdmin {
        require(LINK.transfer(msg.sender, amount), "Error, unable to transfer");
    }

    function withdrawEther(uint256 amount) external onlyAdmin nonReentrant {
        require(address(this).balance >= amount, "Error, contract has insufficient balance");
        admin.transfer(amount);
        emit Withdraw(admin, amount);
    }
}