using BLL.Interfaces;
using DAL.Models;
using DAL.Repositories.Pagination;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using webapi.ModelsForReact;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        public readonly IPostLogic _PostLogic;

        public PostController(IPostLogic PostLogic)
        {
            _PostLogic = PostLogic;
        }


        [HttpGet("GetUserPosts")]
        public async Task<ActionResult<List<Post>>> GetUserPosts([FromHeader] string xAuthAccessToken, [FromQuery] QueryStringParameters queryStringParameters)
        {
            var result = await _PostLogic.GetAllUserPosts(xAuthAccessToken, queryStringParameters);

            if (result == null)
                return BadRequest();

            return Ok(result.ToList());
        }

        [HttpGet("GetCountOfUserPosts")]
        public async Task<int> GetUserPostsCount([FromHeader] string xAuthAccessToken)
        {
            var result = await _PostLogic.GetUserPostsCount(xAuthAccessToken);

            return result;
        }

        [HttpPost("CreatePost")]
        public async Task<ActionResult> CreatePost([FromHeader] string xAuthAccessToken, [FromBody] PostForReact post)
        {
            post.ByteImage = Convert.FromBase64String(post.Image);
            var result = await _PostLogic.CreatePost(xAuthAccessToken, post);

            if (result == false)
                return BadRequest();

            return Ok();
        }

        [HttpGet("GetAllPosts")]
        public async Task<ActionResult<List<User_Post>>> GetAllPosts([FromQuery] QueryStringParameters queryStringParameters, [FromHeader] string xAuthAccessToken = null)
        {
            var result = await _PostLogic.GetAllReccomendedPosts(queryStringParameters, xAuthAccessToken);
            if (result == null)
                return BadRequest();

            return Ok(result);
        }

        [HttpGet("GetCountPosts")]
        public async Task<ActionResult> GetPostsCount()
        {
            var result = await _PostLogic.GetPostsCount();

            if (result == 0)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("DeletePost")]
        public async Task<ActionResult> DeletePost([FromHeader] string xAuthAccessToken, [FromQuery] int idpost)
        {
            var result = await _PostLogic.DeletePost(xAuthAccessToken, idpost);

            if (!result)
                return BadRequest();

            return Ok();
        }

        [HttpPost("SetLike")]
        public async Task<ActionResult> Like([FromHeader] string xAuthAccessToken, [FromQuery] int idpost)
        {
            var result = await _PostLogic.SetLike(xAuthAccessToken, idpost);

            if (!result)
                return BadRequest();

            return Ok();
        }

        [HttpGet("CountLikes")]
        public async Task<ActionResult> CountLikes([FromQuery] int postid)
        {
            var result = _PostLogic._unitOfWork.databaseContext.likes.Where(l => l.PostId == postid).Count();

            return Ok(result);
        }

        [HttpGet("GetSomeonesPosts")]
        public async Task<ActionResult<List<Post>>> GetSomeonesPosts([FromQuery] string id, [FromQuery] QueryStringParameters queryStringParameters, [FromHeader] string xAuthAccessToken = null)
        {
            var result = await _PostLogic.GetSomeonesPosts(xAuthAccessToken, id, queryStringParameters);

            if (result == null)
                return BadRequest();

            return Ok(result.ToList());
        }

        [HttpGet("GetCountOfSomeonesPosts")]
        public async Task<int> GetSomeonesPostsCount([FromQuery] string id)
        {
            var result = await _PostLogic.GetSomeonesPostsCount(id);

            return result;
        }

        [HttpPut("EditPost")]
        public async Task<ActionResult> EditPost([FromHeader] string xAuthAccessToken, [FromBody] PostForReact post)
        {
            post.ByteImage = Convert.FromBase64String(post.Image);
            var result = await _PostLogic.EditPost(xAuthAccessToken, post);

            if (result == false)
                return BadRequest();

            return Ok();
        }


        [HttpGet("GetCountFollowedPosts")]
        public async Task<int> GetCountFollowedPosts([FromHeader] string xAuthAccessToken)
        {
            var result = await _PostLogic.GetFollowedPostsCount(xAuthAccessToken);

            return result;
        }

        [HttpGet("GetAllFollowedPosts")]
        public async Task<ActionResult<List<Post>>> GetAllFollowedPosts([FromHeader] string xAuthAccessToken, [FromQuery] QueryStringParameters queryStringParameters)
        {
            var result = await _PostLogic.GetPaginatedFollowedPosts(xAuthAccessToken, queryStringParameters);

            if (result == null)
                return NotFound();

            return Ok(result);
        }
    }
}
