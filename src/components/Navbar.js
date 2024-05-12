import React from 'react';
import logo from '../logos/dice_logo.png';  // Assuming the logo is the same

function Navbar({ account }) {
  return (
    <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <a
        className="navbar-brand col-sm-3 col-md-2 mr-0"
        href="https://www.yourwebsite.com"  // Update this to your personal or project URL
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={logo} height="32" alt="Game Logo" />
        Betting Game
      </a>
      {!account ? <div className="spinner-border text-light" role="status"></div> :
        <li className="nav-item text-nowrap">
          <a
            className="text-white"
            href={`https://sepolia.etherscan.io/address/${account}`}  // Changed from Rinkeby to Sepolia
            target="_blank"
            rel="noopener noreferrer"
          >
            {account}
          </a>&nbsp;
        </li>
      }
    </nav>
  );
}

export default Navbar;

