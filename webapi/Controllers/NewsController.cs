using DAL.Models;
using DAL.Repositories.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewsController : ControllerBase
    {
        private INewsRepository newsRepository;
        public NewsController(INewsRepository newsRepository)
        {
            this.newsRepository = newsRepository;
        }

        [HttpGet("GetAllNews")]
        public async Task<ActionResult<List<News>>> GetAllNews()
        {
            var result = await newsRepository.GetAllAsync();

            if (result != null)
                return Ok(result.ToList());

            return BadRequest();
        }
    }
}
