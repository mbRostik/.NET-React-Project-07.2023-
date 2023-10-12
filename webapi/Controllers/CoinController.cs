using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CoinController : ControllerBase
    {
        private IUnitOfWork unitOfWork;
        public CoinController(IUnitOfWork unitOfWork)
        { 
            this.unitOfWork = unitOfWork;
        }

        [HttpGet("GetPaginatedCoins")]
        public async Task<ActionResult<List<Coin>>> GetAllCoins([FromQuery] QueryStringParameters queryParameters)
        {
            var result = await unitOfWork.CoinRepository.GetCoinsPagged(queryParameters);

            if (result != null)
                return Ok(result.ToList());

            return BadRequest();
        }

        [HttpGet("GetCountOfAllCoins")]
        public async Task<ActionResult<int>> GetCountOfAllCoins()
        {
            return unitOfWork.databaseContext.coins.Count();
        }
    }
}
