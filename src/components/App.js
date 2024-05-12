import React, { Component } from 'react';
import Loading from './Loading';
import Navbar from './Navbar';
import Main from './Main';
import Web3 from 'web3';
import './App.css';

class App extends Component {
  state = {
    account: null,
    amount: null,
    balance: null,
    contract: null,
    event: null,
    loading: false,
    network: null,
    maxBet: 0,
    minBet: 0,
    web3: null,
    wrongNetwork: false,
    contractAddress: null
  };

  componentDidMount() {
    this.loadWeb3();
    window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    window.ethereum.on('chainChanged', this.handleChainChanged);
  }

  componentWillUnmount() {
    window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
    window.ethereum.removeListener('chainChanged', this.handleChainChanged);
  }

  loadWeb3 = async () => {
    if (typeof window.ethereum !== 'undefined' && !this.state.wrongNetwork) {
      const web3 = new Web3(window.ethereum);
      // const contractAddress = '';
      const contractABI = [...]; // Include ABI here

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const accounts = await web3.eth.getAccounts();
      
      if (accounts.length > 0) {
        const balance = await web3.eth.getBalance(accounts[0]);
        const minBet = await contract.methods.weiInUsd().call();
        const maxBet = await web3.eth.getBalance(contractAddress);

        this.setState({
          web3,
          contract,
          contractAddress,
          account: accounts[0],
          balance,
          minBet,
          maxBet
        });
      }
    }
  };

  handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      this.setState({ account: null, balance: 0 });
    } else {
      const balance = await this.state.web3.eth.getBalance(accounts[0]);
      this.setState({ account: accounts[0], balance });
    }
  };

  handleChainChanged = async (chainId) => {
    const network = parseInt(chainId, 16);
    this.setState({ network });
    if (network !== 4) { // Check for Rinkeby network ID
      this.setState({ wrongNetwork: true });
    } else {
      this.loadWeb3(); // Reload Web3 and contract upon network change to Rinkeby
    }
  };

  makeBet = async (bet, amount) => {
    const { contract, account } = this.state;
    const randomSeed = Math.floor(Math.random() * Math.floor(1e9));
    try {
      const response = await contract.methods.game(bet, randomSeed).send({ from: account, value: amount });
      console.log(response.events.Result.returnValues);
    } catch (error) {
      console.error("Error when making a bet:", error);
    }
  };

  onChange = (value) => {
    this.setState({ amount: value });
  };

  render() {
    const { account, balance, minBet, maxBet, loading, wrongNetwork } = this.state;
    return (
      <div>
        <Navbar account={account} />
        {wrongNetwork ? (
          <div className="container-fluid mt-5 text-monospace text-center">
            <h1>Please connect to the Rinkeby network</h1>
          </div>
        ) : loading ? (
          <Loading balance={balance} maxBet={maxBet} minBet={minBet} />
        ) : (
          <Main
            amount={this.state.amount}
            balance={balance}
            makeBet={this.makeBet}
            onChange={this.onChange}
            maxBet={maxBet}
            minBet={minBet}
            loading={loading}
          />
        )}
      </div>
    );
  }
}

export default App;