import React from 'react';
import dice_rolling from '../logos/dice_rolling.gif';
import eth from '../logos/eth.png';
import './App.css';

function Loading({ balance, maxBet, minBet, web3 }) {
  return (
    <div className="container-fluid mt-5 col-m-4" style={{ maxWidth: '550px' }}>
      <div className="col-sm">
        <main role="main" className="col-lg-12 text-monospace text-center text-white">
          <div className="content mr-auto ml-auto">
            <div id="content" className="mt-3">
              <div className="card mb-4 bg-dark border-danger">
                <div className="card-body">
                  <div>
                    <a
                      href="guarav"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img src={dice_rolling} width="225" alt="Dice rolling" />
                    </a>
                  </div>
                  &nbsp;
                  <p></p>
                  <div className="input-group mb-4">
                    <input
                      id="disabledInput"
                      type="text"
                      className="form-control form-control-md"
                      placeholder="rolling..."
                      disabled
                    />
                    <div className="input-group-append">
                      <div className="input-group-text">
                        <img src={eth} height="20" alt="Ethereum logo"/>&nbsp;<b>ETH</b>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                  >
                    Low
                  </button>
                  &nbsp;&nbsp;&nbsp;
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                  >
                    High
                  </button>
                </div>
                <div>
                  {!balance ? <div id="loader" className="spinner-border float-right" role="status"></div> :
                    <div className="float-right" style={{ width: '220px' }}>
                      <div className="float-left" style={{ height: '17px' }}>
                        <b>MaxBet&nbsp;</b>
                      </div>
                      <div className="float-right" style={{ height: '17px' }}>
                        {Number(web3.utils.fromWei((maxBet).toString())).toFixed(5)} <b>ETH&nbsp;</b>
                      </div>                      
                      <br></br>
                      <div className="float-left" style={{ height: '17px' }}>
                        <b>MinBet</b>($1)&nbsp;
                      </div>
                      <div className="float-right" style={{ height: '17px' }}>
                        {Number(web3.utils.fromWei((minBet).toString())).toFixed(5)} <b>ETH&nbsp;</b>
                      </div>
                      <br></br>
                      <div className="float-left">
                        <b>Balance&nbsp;</b>
                      </div>
                      <div className="float-right">
                        {Number(web3.utils.fromWei((balance).toString())).toFixed(5)} <b>ETH&nbsp;</b>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Loading;
