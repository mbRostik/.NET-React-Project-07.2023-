const { createProxyMiddleware } = require('http-proxy-middleware');

const context = [
    "/coin/GetAllCoins",
    "/coin/GetPaginatedCoins",
    "/coin/GetCountOfAllCoins",

    "/news/GetAllNews",

    "/user/signup",
    "/user/ChangeAvatar",
    "/user/LogIn",
    "/user/GetUserByAccessToken",
    "/user/ChangeName",
    "/user/DeleteRefreshToken",
    "/user/ChangePassword",
    "/user/GetUserById",
    "/user/Follow",
    "/user/CheckFollow",
    "/user/GetCountFollowers",
    "/user/GetUsersSearched",

    "/validatetoken/CheckToken",
    "/validatetoken/CheckAndGiveAccessToken",

    "/wallet/GetCountOfAllWallets",
    "/wallet/GetPaginatedWallets",
    "/wallet/BuyCoin",
    "/wallet/SellCoin",

    "/post/GetUserPosts",
    "/post/GetCountOfUserPosts",
    "/post/CreatePost",
    "/post/GetAllPosts",
    "/post/GetCountPosts",
    "/post/DeletePost",
    "/post/SetLike",
    "/post/GetCountOfSomeonesPosts",
    "/post/GetSomeonesPosts",
    "/post/EditPost",
    "/post/GetAllFollowedPosts",
    "/post/GetCountFollowedPosts"
];

module.exports = function (app) {
    const appProxy = createProxyMiddleware(context, {
        target: 'https://localhost:7116/api',
        secure: false
    });
    app.use(appProxy);
};