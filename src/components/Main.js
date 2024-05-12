import React from 'react';
import dice from '../logos/dice.webp';
import eth from '../logos/eth.png';
import './App.css';

function Main({ amount, balance, maxBet, minBet, web3, makeBet, onChange }) {

  const handleBet = (betType) => {
    const reg = /^[0-9]*\.?[0-9]+$/; // Improved regex to handle numbers properly
    const minBetEth = Number(web3.utils.fromWei(minBet.toString(), 'ether')).toFixed(5);

    if (reg.test(amount) && parseFloat(amount) >= parseFloat(minBetEth)) {
      const amountInWei = web3.utils.toWei(amount, 'ether');
      makeBet(betType, amountInWei);
    } else {
      window.alert(`Please ensure the bet is a positive number and at least ${minBetEth} ETH.`);
    }
  };

  return (
    <div className="container-fluid mt-5 col-m-4" style={{ maxWidth: '550px' }}>
      <div className="col-sm">
        <main role="main" className="col-lg-12 text-monospace text-center text-white">
          <div className="content mr-auto ml-auto">
            <div id="content" className="mt-3">
              <div className="card mb-4 bg-dark border-danger">
                <div className="card-body">
                  <div>
                    <a href="Guarav" target="_blank" rel="noopener noreferrer">
                      <img src={dice} width="225" alt="Dice" />
                    </a>
                  </div>
                  &nbsp;
                  <div className="input-group mb-4">
                    <input
                      type="number"
                      step="0.01"
                      className="form-control form-control-md"
                      placeholder="bet amount..."
                      value={amount}
                      onChange={(e) => onChange(e.target.value)}
                      required
                    />
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <img src={eth} height="20" alt="ETH logo"/>&nbsp;<b>ETH</b>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={() => handleBet(0)}>
                      Low
                  </button>
                  &nbsp;&nbsp;&nbsp;
                  <button
                    className="btn btn-success btn-lg"
                    onClick={() => handleBet(1)}>
                      High
                  </button>
                </div>
                <div>
                  {!balance ? <div id="loader" className="spinner-border float-right" role="status"></div> :
                    <div className="float-right" style={{ width: '220px' }}>
                      <b>Balance: </b>{Number(web3.utils.fromWei(balance.toString(), 'ether')).toFixed(5)} <b>ETH</b><br />
                      <b>MaxBet: </b>{Number(web3.utils.fromWei(maxBet.toString(), 'ether')).toFixed(5)} <b>ETH</b><br />
                      <b>MinBet: </b>{Number(web3.utils.fromWei(minBet.toString(), 'ether')).toFixed(5)} <b>ETH ($1)</b>
                    </div>
                  }
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
}

export default Main;
