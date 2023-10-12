using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IWalletLogic
    {
        IUnitOfWork _unitOfWork { get; }
        Task<bool> BuyCoin(string accessToken, WalletForReact ids);
        Task<bool> SellCoin(string accessToken, WalletForReact model);
        Task<List<WalletForReact>> GetAllWallets(string accessToken, QueryStringParameters queryStringParameters);
        Task<int> GetCountOfUserWallets(string accessToken);

    }
}
