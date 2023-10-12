import React, { useEffect, useState } from 'react';
import { checkLogged, formatDateTime } from '../../../Functions/Functions';
import axios from '../../../../node_modules/axios/index';
import { ToastContainer, toast } from 'react-toastify';
import "../Profile.css";
import { ThreeDots } from 'react-loader-spinner';
import { useParams } from '../../../../node_modules/react-router-dom/dist/index';
import ReactPaginate from 'react-paginate';
import { FaHeart } from 'react-icons/fa';
import { useContext } from 'react';
import { NavbarContext } from '../../../Contexts/NavbarContext';
const CancelToken = axios.CancelToken;
let cancel;

const SomeoneProfile = () => {
    const { id } = useParams();
    const { user } = useContext(NavbarContext);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [liked, setLiked] = useState({});
    const [followed, setFollowed] = useState(false);
    const [userOnPage, setUserOnPage] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [countLikes, setCountLikes] = useState({});
    const [countFollowers, setCountFollowers] = useState(0);
    const [imageOnScreen, setImageOnScreen] = useState(null);
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        const cancelTokenSource = CancelToken.source();
        const check = async () => {
            setLoading(true);
            try {
                if (cancel) {
                    cancel();
                }
                if (await checkLogged()) {
                    setIsAuth(true);
                    axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
                    const responsefollowed = await axios.get(`/user/CheckFollow?userid=${id}`, {
                        cancelToken: cancelTokenSource.token
                    });
                    delete axios.defaults.headers.common['xAuthAccessToken'];
                    setFollowed(responsefollowed.data);
                }

                const totalCount = await getCountOfPosts();
                const pageSize = 5;
                setTotalPages(Math.ceil(totalCount / pageSize));

                const responseuser = await axios.get(`/user/GetUserById?id=${id}`, {
                    cancelToken: cancelTokenSource.token
                });
                setUserOnPage(responseuser.data);

                const responsefollowers = await axios.get(`/user/GetCountFollowers?userid=${id}`, {
                    cancelToken: cancelTokenSource.token
                });
                setCountFollowers(responsefollowers.data);

                axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
                const response = await axios.get(`/post/GetSomeonesPosts?id=${id}&PageNumber=${1}&PageSize=5`, {
                    cancelToken: cancelTokenSource.token
                });
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

            catch (err) {
                if (!axios.isCancel(err)) {
                    console.log(err);
                }
            }
        };

        check();
        return () => {
            cancelTokenSource.cancel();
        };
    }, [id]);

    const getCountOfPosts = async () => {
        try {
            const response = await axios.get(`/post/GetCountOfSomeonesPosts?id=${id}`);
            return response.data;
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleFollow = async () => {
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

        if (user.id === id) {
            toast.error('You can not follow yourself.', {
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

        try {
            setLoadingPosts(true);
            axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
            const response = await axios.post(`/user/Follow?userid=${id}`);
            delete axios.defaults.headers.common["xAuthAccessToken"];
            setFollowed(response.data);

            if (!followed) {
                setCountFollowers((prevCountFollowers) => prevCountFollowers + 1)
            }
            else {
                setCountFollowers((prevCountFollowers) => prevCountFollowers - 1)
            }
            setLoadingPosts(false);
        }
        catch (err) {
            console.log(err);
        }
    }

    const handlePageChange = async (selectedPage) => {
        setLoadingPosts(true);
        axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
        const response = await axios.get(`/post/GetSomeonesPosts?id=${id}&PageNumber=${selectedPage.selected + 1}&PageSize=5`);
        delete axios.defaults.headers.common["xAuthAccessToken"];
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

    const renderProfile = () => {
        return (
            <div>
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
                <div className="allcomponents">
                    <div className="firstcomponent">
                        <div className="avatar-container">
                            <img style={{ cursor: 'pointer' }} src={`data:image/png;base64,${userOnPage.avatar}`} className="avatar" alt="" onClick={() => handleOpenImage(userOnPage.avatar)} />
                        </div>
                        <div className="ProfileInfo">
                            <h3>{userOnPage.userName}</h3>
                            <h3>Followers: {countFollowers}</h3>
                            {!followed ? <button className="AllButton" onClick={() => handleFollow()}>Follow</button> : <button className="AllButton" onClick={() => handleFollow()}>Unfollow</button>}
                        </div>
                    </div>
                </div>
                <hr></hr>
            </div>
        );
    }

    const renderWall = () => {
        if (posts.length === 0) {
            return (
                <div>
                    <h3>Wall is Empty</h3>
                </div>
            );
        }

        return (
            <>
                <div className={`overlay ${loading ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>

                <h2>Wall</h2>
                <br />
                {posts.map((post) => (
                    <div className="Posts" key={post.id}>
                        <div className="Up">
                            <img style={{ cursor: 'pointer' }} src={`data:image/png;base64,${userOnPage.avatar}`} className="UpAvatar" alt="" onClick={() => handleOpenImage(userOnPage.avatar)} />
                            <p className="UpName">{userOnPage.userName}</p>
                            <p className="UpDate">{formatDateTime(post.date)}</p>
                        </div>
                        <div className="Down">
                            <div className="Post">
                                <div>
                                    <h3>{post.title}</h3>

                                    <div className="PostText">
                                        {post.text}
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
                                    {liked[post.id] ? <FaHeart color="red" /> : <FaHeart />}
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

    let contents = loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} ><ThreeDots color="#00BFFF" height={80} width={80} /></div>
        : <>{renderProfile()}{renderWall()}</>;

    return (
        <div>
            {contents}
        </div>
    );
}

export default SomeoneProfile;