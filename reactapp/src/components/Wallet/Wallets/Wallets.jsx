import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { checkLogged } from '../../../Functions/Functions';
import { Navigate } from 'react-router';
import { ThreeDots } from 'react-loader-spinner';
import ReactPaginate from 'react-paginate';
import "../Wallet.css";

const Wallets = () => {
    const [wallets, setWallets] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingWallets, setLoadingWallets] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [countToSell, setCountToSell] = useState({});

    useEffect(() => {
        const check = async () => {
            try {
                const isLoggedIn = await checkLogged();

                if (isLoggedIn) {
                    const totalCount = await getCountOfWallets();
                    const pageSize = 3;
                    setTotalPages(Math.ceil(totalCount / pageSize));
                    axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
                    const response = await axios.get(`/wallet/GetPaginatedWallets?PageNumber=1&PageSize=${pageSize}`);
                    delete axios.defaults.headers.common['xAuthAccessToken'];
                    setWallets(response.data);
                    setIsLoggedIn(true);
                    setLoading(false);
                }

                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        };

        check();
    }, []);

    const handleSellCoin = async (event, coinId) => {
        event.preventDefault();
        setLoadingWallets(true);
        const count = +countToSell[coinId];

        try {
            axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
            await axios.post('/wallet/SellCoin', { coinId, count });
            delete axios.defaults.headers.common['xAuthAccessToken'];

            window.location.href = '/wallet';
        } catch (err) {
            console.log(err);
        }
    };

    const handleChangeToSell = (e, coinId) => {
        const value = e.target.value;
        setCountToSell((prevCountToSell) => ({
            ...prevCountToSell,
            [coinId]: value,
        }));
    };

    const handlePageChange = async (selectedPage) => {
        setLoadingWallets(true);
        axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
        const response = await axios.get(`/wallet/GetPaginatedWallets?PageNumber=${selectedPage.selected + 1}&PageSize=3`);
        delete axios.defaults.headers.common["xAuthAccessToken"];
        setWallets(response.data);
        setLoadingWallets(false);
    };


    const renderWallet = () => {
        if (!isLoggedIn) {
            return <Navigate to="/login" />;
        }

        if (wallets.length === 0) {
            return (
                <div className="LeftSide">
                    <h3>Your coins</h3>
                    <div>Empty</div>
                </div>
            );
        }

        return (
            <>
                <div className={`overlay ${loadingWallets ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>
                <div className="LeftSide">
                    <div><h3>Your coins</h3></div>
                    <div className="YourCoins">
                        {wallets.map((wallet) => (
                            <div key={wallet.coinId}>
                                {wallet.coinName} - {wallet.count}
                                <form onSubmit={(e) => handleSellCoin(e, wallet.coinId)}>
                                    <label>
                                        Sell this:
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            pattern="\d*"
                                            placeholder="Count:"
                                            name={`countToSell-${wallet.coinId}`}
                                            value={countToSell[wallet.coinId] || ''}
                                            onChange={(e) => handleChangeToSell(e, wallet.coinId)}
                                            required
                                        />
                                    </label>
                                    <button type="submit" className="AllButton">Sell</button> <br /><br />
                                </form>
                            </div>
                        ))}
                        <ReactPaginate
                            className="pagination"
                            pageCount={totalPages}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageChange}
                            activeClassName={"active"}
                            nextLinkClassName={"disable"}
                            previousClassName={"disable"}
                        />
                    </div>
                </div>
            </>
        );
    };
    const getCountOfWallets = async () => {
        try {
            axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
            const response = await axios.get('/wallet/GetCountOfAllWallets');
            delete axios.defaults.headers.common['xAuthAccessToken'];
            return response.data;
        } catch (err) {
            console.log(err);
        }
    };

    let walletsElement = loading ? <></> : renderWallet();

    return (
        <>
            {loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}> <ThreeDots color="#00BFFF" height={80} width={80} /></div >
                :
                <div>
                    {walletsElement}
                </div>
            }
        </>
    );
};

export default Wallets;