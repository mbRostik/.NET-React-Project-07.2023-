import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import { ToastContainer, toast } from 'react-toastify';
import ReactPaginate from 'react-paginate';
import { FaHeart } from 'react-icons/fa';
import { checkLogged, formatDateTime } from '../../../Functions/Functions';
import { useNavigate } from 'react-router-dom'

const FollowedPosts = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [liked, setLiked] = useState({});
    const [countLikes, setCountLikes] = useState({});
    const [imageOnScreen, setImageOnScreen] = useState(null);
    const [isAuth, setIsAuth] = useState(false);


    useEffect(() => {
        const check = async () => {
            try {
                if (await checkLogged())
                    setIsAuth(true);

                if (await checkLogged()) {
                    const totalCount = await getCountOfFollowedPosts();
                    const pageSize = 5;
                    setTotalPages(Math.ceil(totalCount / pageSize));
                    axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
                    const response = await axios.get(`/post/GetAllFollowedPosts?PageNumber=1&PageSize=${pageSize}`);
                    delete axios.defaults.headers.common['xAuthAccessToken'];
                    setPosts(response.data);

                    const initialLiked = response.data.reduce((acc, post) => {
                        acc[post.id] = post.liked;
                        return acc;
                    }, {});

                    const initialLikesCount = response.data.reduce((acc, post) => {
                        acc[post.id] = post.countLikes;
                        return acc;
                    }, {});

                    setLiked(initialLiked);
                    setCountLikes(initialLikesCount);
                    setLoading(false);
                }
                else {
                    navigate('/login');
                }
            }

            catch (err) {
                console.log(err);
            }
        };

        check();
    }, []);

    const getCountOfFollowedPosts = async () => {
        try {
            axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
            const response = await axios.get(`/post/GetCountFollowedPosts`);
            delete axios.defaults.headers.common['xAuthAccessToken'];
            return response.data;
        }
        catch (err) {
            console.log(err);
        }
    }

    const handlePageChange = async (selectedPage) => {
        setLoadingPosts(true);
        axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
        const response = await axios.get(`/post/GetAllFollowedPosts?PageNumber=${selectedPage.selected + 1}&PageSize=5`);
        delete axios.defaults.headers.common['xAuthAccessToken'];
        setPosts(response.data);

        const initialLiked = response.data.reduce((acc, post) => {
            acc[post.id] = post.liked;
            return acc;
        }, {});

        const initialLikesCount = response.data.reduce((acc, post) => {
            acc[post.id] = post.countLikes;
            return acc;
        }, {});

        setLiked(initialLiked);
        setCountLikes(initialLikesCount);
        setLoadingPosts(false);
        window.scrollTo(0, 0);
    };

    const handleSetLike = async (postId) => {
        if (!isAuth) {
            toast.error('You must be authorized for this.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;
        }

        axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
        await axios.post(`/post/SetLike?idpost=${postId}`);
        delete axios.defaults.headers.common['xAuthAccessToken'];

        if (liked[postId] === true) {
            setCountLikes((prevLikesCount) => ({
                ...prevLikesCount,
                [postId]: prevLikesCount[postId] - 1,
            }));
        }
        else {
            setCountLikes((prevLikesCount) => ({
                ...prevLikesCount,
                [postId]: prevLikesCount[postId] + 1,
            }));
        }
        
        setLiked((prevLiked) => ({
            ...prevLiked,
            [postId]: !prevLiked[postId],
        }));
    };

    const handleOpenImage = (image) => {
        setImageOnScreen(image);
    }

    const handleCloseImage = () => {
        setImageOnScreen(null);
    }

    const refreshToProfile = (userid) => {
        navigate(`/user/${userid}`);
        window.scrollTo(0, 0);
    }

    const renderPosts = () => {
        if (posts.length === 0) {
            return (
                <div>
                    <h3>Empty</h3>
                </div>
            );
        }

        return (
            <>
                <div className={`overlay ${imageOnScreen ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', userSelect: 'none' }} onClick={handleCloseImage}>
                        <img src={`data:image/png;base64,${imageOnScreen}`} className="PostPhoto" alt="" />
                    </div>
                </div>
                <div className={`overlay ${loadingPosts ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                <br />
                {posts.map((post) => (
                    <div key={post.id} className="Posts">
                        <div className="Up">
                            <div className="SomeonesProfile" onClick={() => refreshToProfile(post.userId)}>
                                <img src={`data:image/png;base64,${post.avatar}`} className="UpAvatar" alt="" />
                                <p className="UpName">{post.userName}</p>
                            </div>
                            <p className="UpDate">{formatDateTime(post.date)}</p>
                        </div>
                        <div className="Down">
                            <div className="Post">
                                <div>
                                    <h3>{post.title}</h3>

                                    <div className="PostText">
                                        {post.text.split(' ').map((word, index) => (
                                            <span key={index}>{word} </span>
                                        ))}
                                    </div>
                                    <div >
                                        <img src={`data:image/png;base64,${post.photo}`} alt="" className="PostPhoto" onClick={() => handleOpenImage(post.photo)} />
                                    </div>
                                </div>
                            </div>
                            <div className="Like_Count">
                                <button
                                    id={post.id}
                                    className="like-button"
                                    onClick={() => handleSetLike(post.id)}
                                >
                                    {liked[post.id] ? <FaHeart className="Heart" color="red" /> : <FaHeart />}
                                </button>
                                <div>{!isNaN(countLikes[post.id]) ? countLikes[post.id] : 0}</div>    
                            </div>
                            
                        </div>
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
            </>
        );
    };

    let contents = loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} ><ThreeDots color="#00BFFF" height={80} width={80} /></div>
    ) : (
        renderPosts()
    );

    return (
        <div>
            {contents}
        </div>
    );
};

export default FollowedPosts;