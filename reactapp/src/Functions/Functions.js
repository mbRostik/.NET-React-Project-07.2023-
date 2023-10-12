import axios from '../../node_modules/axios/index';

export const checkLogged = async () => {

    if (localStorage.getItem("refreshToken")) {
        axios.defaults.headers.common["xauthrefreshtoken"] = localStorage.getItem("refreshToken");
        const response1 = await axios.get("/validatetoken/CheckToken");
        delete axios.defaults.headers.common["xauthrefreshtoken"];

        if (response1.data === true) {

            axios.defaults.headers.common["xAuthRefreshToken"] = localStorage.getItem("refreshToken");
            axios.defaults.headers.common["xAuthAccessToken"] = localStorage.getItem("accessToken");
            const response2 = await axios.get("/validatetoken/CheckAndGiveAccessToken");
            delete axios.defaults.headers.common["xAuthRefreshToken"];
            delete axios.defaults.headers.common["xAuthAccessToken"];

            if (response2.data !== "") {
                localStorage.removeItem("accessToken");
                localStorage.setItem("accessToken", response2.data);

                return true;
            }           

            return true;
            
        }

        localStorage.clear();
        
        return false;
    }
    
    return false;
}

export const LogOut = async () => {
    try {
        localStorage.clear();
        axios.defaults.headers.common["xAuthRefreshToken"] = localStorage.getItem("refreshToken");
        await axios.delete("/user/DeleteRefreshToken");
        delete axios.defaults.headers.common["xAuthRefreshToken"];
    }
    catch (err) {
        console.log(err);
    }
}

export const AddToStorage = (response) => {
    localStorage.setItem("accessToken", response.data.accessToken);
    localStorage.setItem("refreshToken", response.data.refreshToken);
}

export const formatDateTime = (dateTimeString) => {
    const dateTime = new Date(dateTimeString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return dateTime.toLocaleString('ru-RU', options);
};
