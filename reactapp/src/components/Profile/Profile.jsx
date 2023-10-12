import React, { useContext, useEffect, useState } from 'react';
import { LogOut } from '../../Functions/Functions';
import { NavLink } from 'react-router-dom';
import { checkLogged } from '../../Functions/Functions';
import { NavbarContext } from "../../Contexts/NavbarContext";
import axios from '../../../node_modules/axios/index';
import { ToastContainer, toast } from 'react-toastify';
import "./Profile.css";
import { ThreeDots } from 'react-loader-spinner';
import MyPosts from '../Posts/MyPosts/MyPosts';
import { useNavigate } from '../../../node_modules/react-router-dom/dist/index';

const Profile = () => {
    const { user } = useContext(NavbarContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [loadingOverlay, setLoadingOverlay] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                if (await checkLogged()) {
                    setLoading(false);
                    return;
                }
                navigate('/login');
            }
            catch (err) {
                console.log(err);
            }
        }

        check();
    }, []);

    const handleLogout = () => {
        try {
            LogOut();
            window.location.href = '/';
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleMouseEnter = () => {
        setIsHovered(true);
    }

    const handleMouseLeave = () => {
        setIsHovered(false);
    }

    const renderProfile = () => {
        return (
            <div>
                <div className={`overlay ${loadingOverlay ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
                <div className="allcomponents">
                    <div className="firstcomponent">
                        <div className="avatar-container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <img src={`data:image/png;base64,${user.avatar}`} className="avatar" alt="" />
                            {isHovered && (<label className="edit-button">
                                New
                                <input type="file" name="clientAvatar" accept="image/*" onChange={handleImageUpload} required capture="false" />
                            </label>)}
                        </div>

                        <div className="ProfileInfo">
                            <h3>{user.userName}</h3>
                            <h3>{user.email}</h3>
                            <h3>Followers: { user.countFollowers }</h3>
                        </div>                        
                    </div>
                   
                    <div className="LogoutSettingButtons">
                        <NavLink>
                            <button className="AllButton" onClick={handleLogout}>Logout</button>
                        </NavLink>
                        <NavLink to="/profile/settings">
                            <button className="AllButton">Settings</button>
                        </NavLink>
                    </div>
                </div>
                <hr></hr>               
            </div>
        );
    }

    const handleImageUpload = (e) => {
        setLoadingOverlay(true);
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024;
        const maxResolution = 1920;

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
            setLoadingOverlay(false);
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
            setLoadingOverlay(false);
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
                    setLoadingOverlay(false);
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
                        try {
                            axios.defaults.headers.common['xAuthAccessToken'] = localStorage.getItem('accessToken');
                            await axios.post('user/ChangeAvatar', { avatar: base64Avatar });
                            delete axios.defaults.headers.common['xAuthAccessToken'];
                            window.location.href = '/profile';
                        }
                        catch (err) {
                            toast.error(err, {
                                position: "top-right",
                                autoClose: 5000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                            });
                        }
                        setLoadingOverlay(false);
                    };
                    reader.readAsArrayBuffer(file);
                }
            };
            img.src = URL.createObjectURL(file);
        }
    };

    const isImageFile = (file) => {
        const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];

        return acceptedImageTypes.includes(file.type);
    };

    let contents = loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} ><ThreeDots color="#00BFFF" height={80} width={80} /></div>
        : <>{renderProfile()}<MyPosts /></>;
        
    return (
        <div>
            {contents}       
        </div>                        
    );
}

export default Profile;