import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AddToStorage, checkLogged } from '../../Functions/Functions';
import { Navigate } from 'react-router';
import { ToastContainer, toast } from 'react-toastify';
import { ThreeDots } from 'react-loader-spinner';
import '../Registration/registration.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);
    const [loadingOverlay, setLoadingOverlay] = useState(false);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const isLoggedIn = await checkLogged();

                if (!isLoggedIn) {
                    setLoading(false);
                    return;
                }

                setIsLoggedIn(true);
                setLoading(false);
            } catch (err) {
                console.log(err);
            }
        };

        checkLoginStatus();
    }, []);

    const handleChange = (e) => {
        if (e.target.name === 'email') {
            setEmail(e.target.value);
        } else if (e.target.name === 'password') {
            setPassword(e.target.value);
        }
    };

    const confirmLogin = async (e) => {
        e.preventDefault();

        setLoadingButton(true);
        setLoadingOverlay(true);

        try {
            const response = await axios.post('user/LogIn', { email, password });
            AddToStorage(response);
            window.location.href = '/';
        } catch (err) {
            toast.error(err.response.data, {
                position: 'top-right',
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

    const renderLogin = () => {
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

                <form onSubmit={confirmLogin} className="registration-form">
                    <h2>Login</h2>
                    <label className="form-group">
                        Email:
                        <input type="email" name="email" value={email} onChange={handleChange} required />
                    </label>
                    <label className="form-group">
                        Password:
                        <input type="password" name="password" value={password} onChange={handleChange} required /> <br />
                    </label>
                    <br />

                    <button type="submit" className={`AllButton ${loadingButton ? 'disabled' : ''}`} disabled={loadingButton}>
                        Login
                    </button>
                </form>
            </div>
        );
    };

    let content = loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
    ) : (
        renderLogin()
    );

    return <div>{content}</div>;
};

export default Login;