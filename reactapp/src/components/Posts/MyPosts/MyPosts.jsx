import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ThreeDots } from 'react-loader-spinner';
import { toast } from 'react-toastify';
import "./MyPosts.css"
import ReactPaginate from 'react-paginate';
import { NavbarContext } from "../../../Contexts/NavbarContext";
import { FaHeart } from 'react-icons/fa';
import { formatDateTime } from '../../../Functions/Functions';

const MyPosts = () => {
    const { user } = useContext(NavbarContext);
    const [editMode, setEditMode] = useState(false);
    const [editedPosts, setEditedPosts] = useState([]);
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [totalPages, setTotalPages] = useState(0);
    const [text, setText] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [liked, setLiked] = useState({});
    const [countLikes, setCountLikes] = useState({});
    const [imageOnScreen, setImageOnScreen] = useState(null);
    const [oldimage, setOldImage] = useState('');
    const [prevEditedPostId, setPrevEditedPostId] = useState(null);

    useEffect(() => {
        const check = async () => {
            try {
                const totalCount = await getCountOfPosts();
                const pageSize = 5;
                setTotalPages(Math.ceil(totalCount / pageSize));
                axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
                const response = await axios.get(`/post/GetUserPosts?PageNumber=1&PageSize=${pageSize}`);
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
                console.log(err);
            }
        };

        check();
    }, []);


    const handleEditPost = (postId) => {
        if (editMode) {
            toast.warning('Does not allowed multiple-editing.', {
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

        if (prevEditedPostId && prevEditedPostId !== postId) {
            setEditMode((prevEditMode) => ({
                ...prevEditMode,
                [prevEditedPostId]: false,
            }));
        }
        const post = posts.find((post) => post.id === postId);

        setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [postId]: { ...prevEditedPosts[postId], title: post.title } }))
        setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [postId]: { ...prevEditedPosts[postId], text: post.text } }))

        if (prevEditedPostId !== postId) {
            const post = posts.find((post) => post.id === postId);
            setOldImage(post.photo);
        }

        setEditMode((prevEditMode) => ({
            ...prevEditMode,
            [postId]: !prevEditMode[postId],
        }));
        setPrevEditedPostId(postId);
    };


    const handlePageChange = async (selectedPage) => {
        setLoadingPosts(true);
        axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
        const response = await axios.get(`/post/GetUserPosts?PageNumber=${selectedPage.selected + 1}&PageSize=5`);
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

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleTextChange = (e) => {
        setText(e.target.value);
    };

    const isImageFile = (file) => {
        const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
        return acceptedImageTypes.includes(file.type);
    };

    const handleSetLike = async (postId) => {
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

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024;
        const maxResolution = 5000;

        if (file && !isImageFile(file)) {
            toast.error('Allowed extensions: image/jpeg, image/png, image/svg+xml, image/webp.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            e.target.value = null;
            return;
        }

        if (file && file.size > maxSize) {
            toast.error('The max size of photo: 2mb.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            e.target.value = null;
            return;
        }

        if (file) {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                if (width > maxResolution || height > maxResolution) {
                    toast.error(`The maximum image resolution must be ${maxResolution}x${maxResolution} pixels.`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    e.target.value = null;
                    return;
                }
                else {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const imageData = reader.result;
                        const blob = new Blob([new Uint8Array(imageData)], { type: file.type });
                        const base64Avatar = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result.split(',')[1]);
                            reader.readAsDataURL(blob);

                        });
                        setImage(base64Avatar);
                        toast.success('File uploaded successfully!', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    };
                    reader.readAsArrayBuffer(file);
                }
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleImageUpload2 = (e, postId, ph) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024;
        const maxResolution = 5000;
        setOldImage(ph);
        if (file && !isImageFile(file)) {
            toast.error('Allowed extensions: image/jpeg, image/png, image/svg+xml, image/webp.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            e.target.value = null;
            return;
        }

        if (file && file.size > maxSize) {
            toast.error('The max size of photo: 2mb.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            e.target.value = null;
            return;
        }

        if (file) {
            const img = new Image();
            img.onload = () => {
                const width = img.width;
                const height = img.height;
                if (width > maxResolution || height > maxResolution) {
                    toast.error(`The maximum image resolution must be ${maxResolution}x${maxResolution} pixels.`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });

                    e.target.value = null;
                    return;
                }
                else {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const imageData = reader.result;
                        const blob = new Blob([new Uint8Array(imageData)], { type: file.type });
                        const base64Avatar = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result.split(',')[1]);
                            reader.readAsDataURL(blob);
                        });

                        setPosts(prevPosts =>
                            prevPosts.map(post =>
                                post.id === postId ? { ...post, photo: base64Avatar } : post
                            )
                        );

                        toast.success('File uploaded successfully!', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    };
                    reader.readAsArrayBuffer(file);
                }
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            setLoadingPosts(true);
            axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
            await axios.post(`/post/CreatePost`, { title, text, image });
            delete axios.defaults.headers.common["xAuthAccessToken"];
            toast.success('Post has been sended! Reload your page.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setImage('');
            setTitle('');
            setText('');
        }
        catch (err) {
            console.log();
        };
        setLoadingPosts(false);
    }


    const handleSavePost = async (postId, photo, e) => {
        e.preventDefault();

        const post = posts.find((post) => post.id === postId);

        if (editedPosts[postId].title === post.title && editedPosts[postId].text === post.text && photo === oldimage) {
            toast.warning('No changes to save!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return;               
        }

        if (editedPosts[postId].title.trim() === '') {
            toast.warning('Title should be have!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return
        }

        setPrevEditedPostId(null);
        const editedPost = editedPosts[postId];

        const { title: editedTitle, text: editedText } = editedPost;
        const title = editedTitle !== undefined ? editedTitle : posts.find((post) => post.id === postId).title;
        const text = editedText !== undefined ? editedText : posts.find((post) => post.id === postId).text;

        try {
            setLoadingPosts(true);

            axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
            await axios.put('/post/EditPost', { postId, title, text, image: photo });
            delete axios.defaults.headers.common['xAuthAccessToken'];
            toast.success('Post has been saved!', {
                position: 'top-right',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post.id === postId ? { ...post, photo: photo, title: title, text: text } : post
                )
            );

            setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [postId]: undefined }));
            setEditMode(false);
        }
        catch (err) {
            console.log(err);
        }

        setLoadingPosts(false);
    };

    const handleOpenImage = (image) => {
        setImageOnScreen(image);
    }

    const handleCloseImage = () => {
        setImageOnScreen(null);
    }

    const renderFormPost = () => {
        return (
            <>
                <div className="Forma">
                    <div className={`overlay ${imageOnScreen ? 'visible' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', userSelect: 'none' }} onClick={handleCloseImage}>
                            <img src={`data:image/png;base64,${imageOnScreen}`} className="PostPhoto" alt="" />
                        </div>
                    </div>
                    <div className={`overlay ${loadingPosts ? 'visible' : ''}`}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                            <ThreeDots color="#00BFFF" height={80} zwidth={80} />
                        </div>
                    </div>
                    <form onSubmit={handleCreatePost} className="create-post-form">
                        <div className="form-group">
                            <label htmlFor="title">Title:</label>
                            <input type="text" id="title" value={title} onChange={handleTitleChange} maxLength={30} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="text">Text:</label>
                            <textarea
                                id="text"
                                value={text}
                                onChange={handleTextChange}
                                className="text-area"
                                maxLength={800}
                            />
                        </div>
                        {image !== "" ? <div>
                            <img src={`data:image/png;base64,${image}`} className="PostPhoto" alt="" />
                        </div> : <></>}
                        <div className="file-upload">
                            <label htmlFor="clientAvatar" className="custom-file-upload">Click to select image
                                <input type="file" id="clientAvatar" name="clientAvatar" placeholder="" accept="image/*" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <button type="submit" className="AllButton">Create Post</button>
                    </form>
                </div>
            </>
        );
    };


    const renderWall = () => {
        if (posts.length === 0) {
            return (
                <div>
                    <h3>Your Wall is Empty</h3>
                </div>
            );
        }

        return (
            <>
                <div className={`overlay ${loading ? "visible" : ""}`}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>

                <h2>Your Wall</h2>
                <br />
                {posts.map((post) => (
                    <div className="Posts" key={post.id}>
                        <div className="Up">
                            <img
                                style={{ cursor: "pointer" }}
                                src={`data:image/png;base64,${user.avatar}`}
                                className="UpAvatar"
                                alt=""
                                onClick={() => handleOpenImage(user.avatar)}
                            />
                            <p className="UpName">{user.userName}</p>
                            <p className="UpDate">{formatDateTime(post.date)}</p>
                            <div>
                                <button className="AllButton" onClick={() => DeletePost(post.id)}>
                                    Delete
                                </button>
                                {!editMode[post.id] ?  (
                                    <button className="AllButton" onClick={() => handleEditPost(post.id)}>
                                        Edit
                                    </button>
                                ) : (
                                    <>
                                    <button className="AllButton" onClick={(e) => handleSavePost(post.id, post.photo, e)}>
                                        Save
                                    </button>
                                            <button className="AllButton" onClick={() => { setEditMode(false);post.photo = oldimage;}}>
                                        Cancel
                                            </button>
                                        </>
                                )}
                            </div>
                        </div>
                        <div className="Down">
                            {editMode[post.id] ? (
                                <div className="Post">
                                    <div>
                                        <input
                                            type="text"
                                            value={editedPosts[post.id]?.title}
                                            onChange={(e) => setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [post.id]: { ...prevEditedPosts[post.id], title: e.target.value } }))}
                                        />
                                        <textarea
                                            value={editedPosts[post.id]?.text}
                                            onChange={(e) => setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [post.id]: { ...prevEditedPosts[post.id], text: e.target.value } }))}
                                        />
                                        <div>
                                            <img src={`data:image/png;base64,${post.photo}`} className="PostPhoto" alt="" onClick={() => handleOpenImage(post.photo)} />
                                            {post.photo !== '' && (
                                                <div>
                                                    <button className="AllButton" onClick={() => { setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [post.id]: { ...prevEditedPosts[post.id], image: null } })); setOldImage(post.photo); post.photo = '' }}>
                                                        Remove Image
                                                    </button>
                                                </div>
                                            )}
                                            <div className="file-upload">
                                                <label htmlFor={`editImage${post.id}`} className="custom-file-upload">Change Image
                                                    <input type="file" id={`editImage${post.id}`} name={`editImage${post.id}`} placeholder="" accept="image/*" onClick={(e) => (e.target.value = null)} onChange={(e) => { handleImageUpload2(e, post.id, post.photo); setEditedPosts((prevEditedPosts) => ({ ...prevEditedPosts, [post.id]: { ...prevEditedPosts[post.id], image: post.photo } })) }} />


                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="Post">
                                    <div>
                                        <h3>{post.title}</h3>

                                        <div className="PostText">{post.text}</div>

                                        <div>
                                            <img src={`data:image/png;base64,${post.photo}`} className="PostPhoto" alt="" onClick={() => handleOpenImage(post.photo)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="Like_Count">
                                <button id={post.id} className="like-button" onClick={() => handleSetLike(post.id)}>
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


    const DeletePost = async (postId) => {
        try {
            axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
            await axios.delete(`/post/DeletePost?idpost=${postId}`);
            delete axios.defaults.headers.common['xAuthAccessToken'];
            window.location.href = '/profile';
        }
        catch (err) {
            console.log(err);
        }
    }

    const getCountOfPosts = async () => {
        try {
            axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
            const response = await axios.get(`/post/GetCountOfUserPosts`);
            delete axios.defaults.headers.common['xAuthAccessToken'];
            return response.data;
        }
        catch (err) {
            console.log(err);
        }
    }

    let contents = loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
    ) : (
        renderFormPost()
    );

    let wall = loading ? <></> : renderWall();
    return (
        <div>
            <h2>Posts</h2>
            {contents}
            {wall}
        </div>
    );
};

export default MyPosts;