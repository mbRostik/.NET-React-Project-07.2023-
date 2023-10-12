using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class CoinRepository : GenericRepository<Coin>, ICoinRepository
    {
        public CoinRepository(MyContext databaseContext)
          : base(databaseContext)
        {
        }

        public async Task<Pagination<Coin>> GetCoinsPagged(QueryStringParameters queryStringParameters)
        {
            var coins = databaseContext.coins.AsEnumerable();

            var paged_list_coins = await Pagination<Coin>.ToPagedListAsync(coins, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }
    }
}
