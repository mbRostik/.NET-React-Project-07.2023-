using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories.Contracts
{
    public interface IUnitOfWork
    {
        ICoinRepository CoinRepository { get; }
        IWalletRepository WalletRepository { get; }
        IPostRepository PostRepository { get; }
        IFollowRepository FollowRepository { get; }
        Task SaveChangesAsync();
        MyContext databaseContext { get; }
    }
}
