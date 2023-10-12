import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const populateNews = async () => {
            try {
                const response = await axios.get('news/GetAllNews');
                setNews(response.data);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        };

        populateNews();
    }, []);

    const renderNews = (newsData) => {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <tbody>
                    {newsData.map((newsItem) => (
                        <tr key={newsItem.id}>
                            <td>{newsItem.title}</td>
                            <td>{newsItem.text}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    let contents = loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
    ) : (
        renderNews(news)
    );

    return (
        <div>
            <h1>News:</h1>
            {contents}
        </div>
    );
};

export default News;