using BLL.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValidateTokenController : ControllerBase
    {
        private readonly IUserLogic _userLogic;
        public ValidateTokenController(IUserLogic userLogic)
        {
            _userLogic = userLogic;
        }

        [HttpGet("CheckToken")]
        public async Task<ActionResult<bool>> CheckRefreshToken([FromHeader] string xauthrefreshtoken)
        {
            var model = await _userLogic.CheckRefreshToken(xauthrefreshtoken);

            if (model == false)
                return Ok(false);

            return Ok(true);
        }

        [HttpGet("CheckAndGiveAccessToken")]
        public async Task<ActionResult<string>> CheckAndGiveAccessToken([FromHeader] string xAuthRefreshToken, [FromHeader] string xAuthAccessToken)
        {
            var model = await _userLogic.CheckAndGiveAccessToken(xAuthRefreshToken, xAuthAccessToken);

            if (model == null)
                return Ok("");

            return Ok(model);
        }
    }
}