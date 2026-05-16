
using System.Security.Claims;
using API.DTOs;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class BuggyController : BaseApiController
    {
        [HttpGet("unauthorized")]
        public IActionResult GetUnauthorized()
        {
            return Unauthorized("This is an unauthorized request.");
        }

        [HttpGet("badrequest")]
        public IActionResult GetBadRequest()
        {
            return BadRequest("This is a bad request.");
        }

        [HttpGet("notfound")]
        public IActionResult GetNotFound()
        {
            return NotFound("This is a not found request.");
        }

        [HttpGet("internalerror")]
        public IActionResult GetInternalError()
        {
            throw new Exception("This is an internal server error.");
        }

        [HttpPost("validationerror")]
        public IActionResult GetValidationError(CreateProductDto product)
        {
            return Ok();
        }

        [Authorize]
        [HttpGet("secret")]
        public IActionResult GetSecret()
        {
            var name = User.FindFirst(ClaimTypes.Name)?.Value;
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Ok("Hello " + name + " with id " + id);
        }   
    }
}