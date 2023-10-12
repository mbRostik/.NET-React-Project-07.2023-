import React from 'react';
import "./Wallet.css";
import Coins from './Coins/Coins';
import Wallets from './Wallets/Wallets';

const Wallet = () => {

    return (
        <div className="CoinPage">
            <Wallets />
            <Coins />
        </div>
    );
};

export default Wallet;