using BLL.Interfaces;
using DAL.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using webapi.ModelsForReact;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private UserManager<User> _userManager;
        private readonly IUserLogic _userLogic;

        public UserController(UserManager<User> userManager, IUserLogic userLogic)
        {
            _userManager = userManager;
            _userLogic = userLogic;
        }

        [HttpPost("LogIn")]
        public async Task<ActionResult<UserWithToken>> LoginUser(User_Model user)
        {
            var model = await _userLogic.LoginUser(user);

            if (model == null)
                return NotFound("Wrong email or password.");

            return Ok(model);
        }

        [HttpPost("SignUp")]
        public async Task<ActionResult> Reg(User_Model user)
        {
            user.Avatar = Convert.FromBase64String(user.ClientAvatar);
            var model = await _userLogic.Registration(user);

            if (model != "OK")
                return BadRequest(model);

            return Ok();
        }

        [HttpGet("GetUserByAccessToken")]
        public async Task<ActionResult<User>> GetUserByAccessToken([FromHeader] string xAuthAccessToken)
        {
            var user = await _userLogic.GetUserFromAccessToken(xAuthAccessToken);

            if (user == null)
                return NotFound();

            return Ok(user);
        }

        [HttpPost("GetRole")]
        public async Task<ActionResult<string>> GetRole([FromBody] string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
                return NotFound();

            var result = await _userManager.GetRolesAsync(user);

            return Ok(result[0]);
        }

        [HttpDelete("DeleteRefreshToken")]
        public async Task<ActionResult> DeleteRefreshToken([FromHeader] string xAuthRefreshToken)
        {
            var model = await _userLogic.DeleteRefreshToken(xAuthRefreshToken);

            if (model == false)
                return NotFound();

            return Ok(model);
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<User>>> GetAllusers()
        {
            var result = await _userManager.Users.ToListAsync();

            if (result == null)
                return NotFound();

            return result;
        }

        [HttpGet("usertokens")]
        public async Task<ActionResult<List<RefreshToken>>> GetAllUserTokens([FromQuery] string id)
        {
            var result = await _userLogic._unitOfWork.databaseContext.refreshTokens.Where(t => t.UserId == id).ToListAsync();

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("ChangeName")]
        public async Task<ActionResult> ChangeName([FromHeader] string xAuthAccessToken, [FromQuery] string name)
        {
            var model = await _userLogic.ChangeName(xAuthAccessToken, name);

            if (!model)
            {
                return BadRequest();
            }

            return Ok();
        }

        [HttpPost("ChangePassword")]
        public async Task<ActionResult> ChangePassword([FromHeader] string xAuthAccessToken, [FromBody] ChangePasswordModel passwords)
        {
            var model = await _userLogic.ChangePassword(xAuthAccessToken, passwords.oldPassword, passwords.newPassword);

            if (model == false)
                return BadRequest();
            
            return Ok();
        }

        [HttpPost("ChangeAvatar")]
        public async Task<ActionResult> ChangeAvatar([FromHeader] string xAuthAccessToken, [FromBody] Avatar avatar)
        {
            var byteavatar = Convert.FromBase64String(avatar.avatar);

            var result = await _userLogic.ChangeAvatar(xAuthAccessToken, byteavatar);

            if (result == false)
                return BadRequest();

            return Ok();
        }

        [HttpGet("GetUserById")]
        public async Task<ActionResult<User>> GetUserById([FromQuery] string id)
        {
            var user = await _userLogic.GetUserById(id);
            if(user==null || user.Email == null)
            {
                return BadRequest();
            }
            return Ok(user);
        }

        [HttpPost("Follow")]
        public async Task<ActionResult> Follow([FromHeader] string xAuthAccessToken, [FromQuery] string userid)
        {
            var result = await _userLogic.Follow(xAuthAccessToken, userid);

            return Ok(result);
        }

        [HttpGet("CheckFollow")]
        public async Task<ActionResult> CheckFollow([FromHeader] string xAuthAccessToken, [FromQuery] string userid)
        {
            var result = await _userLogic.IsSubscribed(xAuthAccessToken, userid);

            return Ok(result);
        }

        [HttpGet("GetCountFollowers")]
        public async Task<ActionResult> GetCountFollowers([FromQuery] string userid)
        {
            var result = await _userLogic.GetCountFollowers(userid);

            return Ok(result);
        }

        [HttpGet("GetUsersSearched")]
        public async Task<ActionResult<List<User>>> GetUsersSearched([FromQuery] string param)
        {
            var model = _userManager.Users.Where(u => u.UserName.Contains(param.ToLower()));

            if (model == null)
                return null;

            return model.ToList();
        } 
    }
}
