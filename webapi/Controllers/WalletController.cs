using BLL.Interfaces;
using DAL.Models;
using DAL.Repositories.Pagination;
using DAL.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WalletController : ControllerBase
    {
        private readonly IWalletLogic _walletLogic;
        public WalletController(IWalletLogic walletLogic)
        {
            _walletLogic = walletLogic;
        }

        [HttpPost("BuyCoin")]
        public async Task<ActionResult> BuyCoin([FromHeader] string xAuthAccessToken, [FromBody] WalletForReact wallet)
        {
            var model = await _walletLogic.BuyCoin(xAuthAccessToken, wallet);

            if (model == false)
                return BadRequest();

            return Ok();
        }

        [HttpGet("GetPaginatedWallets")]
        public async Task<ActionResult<List<Coin>>> GetAllWallets([FromHeader] string xAuthAccessToken, [FromQuery] QueryStringParameters queryParameters)
        {
            var result = await _walletLogic.GetAllWallets(xAuthAccessToken, queryParameters);

            if (result != null)
                return Ok(result);

            return BadRequest();
        }

        [HttpGet("GetCountOfAllWallets")]
        public async Task<ActionResult<int>> GetCountOfAllWallets([FromHeader] string xAuthAccessToken)
        {
            var result =  await _walletLogic.GetCountOfUserWallets(xAuthAccessToken);

            if (result == 0)
                return BadRequest();

            return Ok(result);
        }

        [HttpPost("SellCoin")]
        public async Task<ActionResult> SellCoin([FromHeader] string xAuthAccessToken, [FromBody] WalletForReact wallet)
        {
            var model = await _walletLogic.SellCoin(xAuthAccessToken, wallet);
            Console.WriteLine(model);

            if (model == false)
                return BadRequest();

            return Ok();
        }
    }
}
