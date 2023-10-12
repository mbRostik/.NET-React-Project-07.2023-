import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { checkLogged } from '../../Functions/Functions';
import "./Navbar.css";
import axios from '../../../node_modules/axios/index';
import { NavbarContext } from "../../Contexts/NavbarContext"

const Navbar = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState([]);
    const [searchUsers, setSearchUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [isInputActive, setIsInputActive] = useState(false);
    let typingTimeout = null;

    useEffect(() => {
        const check = async () => {
            try {
                const isLogged = await checkLogged();
                if (isLogged) {
                    await populateNavBar();
                    setIsLoggedIn(isLogged);
                }
                setLoading(false);
            }
            catch (err) {
                console.log(err);
            }
        }

        check();
    }, [search]);

    const handleInputFocus = () => {
        setIsInputActive(true);
    };


    const populateNavBar = async () => {
        try {
            axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
            const response = await axios.get('/user/GetUserByAccessToken');
            const responsefollowers = await axios.get(`/user/GetCountFollowers?userid=${response.data.id}`);
            delete axios.defaults.headers.common["xAuthAccessToken"];
            setUser(response.data);
            setUser((prevUser) => ({
                ...prevUser,
                countFollowers: responsefollowers.data,
            }));
        }
        catch (err) {
            console.log(err);
        }
    }

    const handleSearch = async (e) => {
        setSearch(e.target.value);

        if (e.target.value) {
            try {
                const response = await axios.get(`/user/GetUsersSearched?param=${e.target.value}`);

                if (!e.target.value)
                    return;

                setSearchUsers(response.data);
            }
            catch (err) {
                console.log(err);
            }
        } 
        else 
            setSearchUsers([]);
    };

    return (
        <NavbarContext.Provider value={{ user }}>
            <div className="NavBarMain">
                <div className="NavBarMenu">
                    <input
                        type="textBar"
                        placeholder="Search profile"
                        value={search}
                        onChange={handleSearch}
                        onFocus={handleInputFocus}
                    />
                    {isInputActive && searchUsers.length > 0 && (
                        <div className="search-results">
                            {searchUsers.map((user) => (
                                <NavLink to={`/user/${user.id}`} key={user.id} className="search-result">
                                    <div className="Ava_Name">
                                        <img className="NavAvatar" src={`data:image/png;base64,${user.avatar}`} alt="" />
                                        <div className="searchedName">{user.userName}</div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    )}

                <NavLink to="/" className="NavBarButton">Home</NavLink>

                {!loading && (
                    <>
                            {isLoggedIn ? (
                                <>
                                <NavLink to="/following" className="NavBarButton">Following</NavLink>
                                <NavLink to="/wallet" className="NavBarButton">Wallet</NavLink>
                                <NavLink to="/profile" className="NavBarButton">
                                    Profile
                                    <img className="NavAvatar" src={`data:image/png;base64,${user.avatar}`} alt="" />
                                </NavLink>  
                                 
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="NavBarButton">Login</NavLink>
                                <NavLink to="/signup" className="NavBarButton">Registration</NavLink>
                            </>
                        )}
                    </>
                )}
            </div>
        </div> 
        { children }
        </NavbarContext.Provider>
    );
}

export default Navbar;