import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import ReactPaginate from 'react-paginate';
import "../Wallet.css";

const Coins = () => {
    const [coins, setCoins] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingCoins, setLoadingCoins] = useState(false);
    const [countToBuy, setCountToBuy] = useState({});

    useEffect(() => {
        const check = async () => {
            try {
                const totalCount = await getCountOfCoin();
                const pageSize = 3;
                setTotalPages(Math.ceil(totalCount / pageSize));
                const response = await axios.get(`/coin/GetPaginatedCoins?PageNumber=1&PageSize=${pageSize}`);
                
                setCoins(response.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        };

        check();
    }, []);

    const handleBuyCoin = async (event, coinId) => {
        event.preventDefault();
        setLoadingCoins(true);
        const count = +countToBuy[coinId];

        try {
            axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
            await axios.post('/wallet/BuyCoin', { coinId, count });
            delete axios.defaults.headers.common['xAuthAccessToken'];

            window.location.href = '/wallet';
        } catch (err) {
            console.log(err);
        }
    };


    const handleChangeToBuy = (e, coinId) => {
        const value = e.target.value;
        setCountToBuy((prevCountToBuy) => ({
            ...prevCountToBuy,
            [coinId]: value,
        }));
    };

    const handlePageChange = async (selectedPage) => {
        setLoadingCoins(true);
        const response = await axios.get(`/coin/GetPaginatedCoins?PageNumber=${selectedPage.selected+1}&PageSize=3`);
        setCoins(response.data);
        setLoadingCoins(false);
    };

    const renderCoins = () => {

        return (
            <>
                <div className={`overlay ${loadingCoins ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>
                <div className="RightSide">
                    <div><h3>Available coins</h3></div>                                        
                        {coins.map((coin) => (
                            <div key={coin.id}>
                                {coin.name} - ${coin.price}
                                <form onSubmit={(e) => handleBuyCoin(e, coin.id)}>
                                    <label>
                                        Buy this:
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            pattern="\d*"
                                            placeholder="Count:"
                                            name={`countToBuy-${coin.id}`}
                                            value={countToBuy[coin.id] || ''}
                                            onChange={(e) => handleChangeToBuy(e, coin.id)}
                                            required
                                        />
                                    </label>
                                    <button type="submit" className="AllButton">Buy</button> <br /><br />
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
            </>
        );
    };

    const getCountOfCoin = async () => {
        try {
            const response = await axios.get(`/coin/GetCountOfAllCoins`);
            return response.data;
        }
        catch (err) {
            console.log(err);
        }
    }

    let coinsElement = loading ? <></> : renderCoins();

    return (
        <div>
            {coinsElement}
        </div>
    );
};

export default Coins;