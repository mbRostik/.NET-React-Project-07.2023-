import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AddToStorage, checkLogged } from '../../Functions/Functions';
import { Navigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import "../css/forall.css";
import "./registration.css";
import { ThreeDots } from 'react-loader-spinner';

const Registration = () => {
    const [clientAvatar, setClientAvatar] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingOverlay, setLoadingOverlay] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const { register, handleSubmit, formState: { errors }, watch } = useForm();

    useEffect(() => {
        const check = async () => {
            try {
                const isLoggedIn = await checkLogged();
                setIsLoggedIn(isLoggedIn);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        };

        check();
    }, []);

    const handleImageUpload = (e) => {
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
                        setClientAvatar(base64Avatar);    
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

    const isImageFile = (file) => {
        const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
        return acceptedImageTypes.includes(file.type);
    };

    const confirmRegistration = async (data) => {
        const { name, email, password } = data;
        setLoadingButton(true);
        setLoadingOverlay(true);
        try {
            await axios.post('user/signup', { name, email, password, clientAvatar });
            const response2 = await axios.post('user/LogIn', { email, password, name });
            AddToStorage(response2);
            window.location.href = '/';
        }
        catch (err) {
            toast.error(err.response.data, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setLoadingButton(false);
            setLoadingOverlay(false);
        }
    };

    const passwordd = watch('password');

    const renderRegistration = () => {
        if (isLoggedIn) {
            return <Navigate to="/" />;
        }

        return (
            <div>
                <div className={`overlay ${loadingOverlay ? 'visible' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                        <ThreeDots color="#00BFFF" height={80} width={80} />
                    </div>
                </div>

                <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />

                <form onSubmit={handleSubmit(confirmRegistration)} className="registration-form">
                    <h2>Registration</h2>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input type="textR" id="name" {...register('name', {  required: 'Enter your username', minLength: { value: 3, message: 'Username must be at least 3 characters long' }, maxLength: { value: 15, message: 'Username must not exceed 15 characters' } })} maxLength="15" />
                        {errors.name && <span className="error">{errors.name.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" id="email" {...register('email', { required: 'Enter your email', pattern: { value: /^\S+@\S+$/, message: 'Enter a valid email' } })} />
                        {errors.email && <span className="error">{errors.email.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" {...register('password', { required: 'Enter a password', minLength: { value: 8, message: 'Password must be at least 8 characters long' }, pattern: { value: /^(?=.*\d)(?=.*[A-Z]).+$/, message: 'Password must contain at least one uppercase letter and a number' } })} />
                        {errors.password && <span className="error">{errors.password.message}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm password:</label>
                        <input type="password" id="confirmPassword" {...register('confirmPassword', { required: 'Confirm your password', validate: value => value === passwordd || 'Passwords do not match' })} />
                        {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
                    </div>

                    {clientAvatar !== "" ? <div>
                        <img src={`data:image/png;base64,${clientAvatar}`} className="avatar" alt="" />
                    </div> : <></> }

                    <div className="file-upload">
                        <label htmlFor="clientAvatar" className="custom-file-upload">Click to select Avatar
                        <input type="file" id="clientAvatar" name="clientAvatar" placeholder="" accept="image/*" {...register('clientAvatar', { required: 'Upload an avatar' })} onChange={handleImageUpload} />
                        </label>
                        {errors.clientAvatar && clientAvatar === '' && <span className="error">{errors.clientAvatar.message}</span>}
                    </div>

                    <br />
                    <button type="submit" className={`AllButton ${loadingButton ? 'disabled' : ''}`} disabled={loadingButton}>SignUp</button>
                </form>  
            </div>          
        );
    };

    let content = loading ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} ><ThreeDots color="#00BFFF" height={80} width={80} /></div> : renderRegistration();

    return (
        <div>
            {content}
        </div>
    );
};

export default Registration;