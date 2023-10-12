using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class WalletRepository : GenericRepository<Wallet>, IWalletRepository
    {
        public WalletRepository(MyContext databaseContext)
          : base(databaseContext)
        {

        }

        public async Task<List<Wallet>> GetAllByIdAsync(string userid)
        {
            return databaseContext.wallets.Where(w => w.UserId == userid).ToList();
        }

        public async Task<Pagination<WalletForReact>> GetPaggedByIdForReactAsync(string userid, QueryStringParameters queryStringParameters)
        {
            var result = databaseContext.wallets
                .Join(databaseContext.users, w => w.UserId, u => u.Id, (w, u) => new { w, u })
                .Join(databaseContext.coins, x => x.w.CoinId, c => c.Id, (x, c) => new WalletForReact {
                    UserId = x.u.Id,
                    CoinId = x.w.CoinId,
                    Count = x.w.Count,
                    CoinName = c.Name
                }).Where(u => u.UserId == userid).AsEnumerable();

            var paged_list_coins = await Pagination<WalletForReact>.ToPagedListAsync(result, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }
    }
}
