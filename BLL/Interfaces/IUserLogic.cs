using DAL.Models;
using DAL.Repositories.Contracts;

namespace BLL.Interfaces
{
    public interface IUserLogic
    {
        IUnitOfWork _unitOfWork { get; }
        Task<UserWithToken> LoginUser(User_Model user);
        string GenerateAccessToken(string userId);
        Task<RefreshToken> FindToken(string token);
        RefreshToken GenerateRefreshToken();
        Task<User> GetUserFromAccessToken(string accessToken);
        Task<string> CheckAndGiveAccessToken(string reft, string acc);
        Task<string> Registration(User_Model user);
        Task<bool> DeleteRefreshToken(string refreshToken);
        Task<bool> CheckRefreshToken(string token);
        Task<bool> ChangeName(string accesstoken, string name);
        Task<bool> ChangePassword(string token, string oldPassword, string newPassword);
        Task<bool> ChangeAvatar(string xAuthAccessToken, byte[] byteavatar);
        Task<User> GetUserById(string id);
        Task<bool> IsSubscribed(string xAuthAccessToken, string userid);
        Task<bool> Follow(string xAuthAccessToken, string userid);
        Task<int> GetCountFollowers(string userid);
    }
}
