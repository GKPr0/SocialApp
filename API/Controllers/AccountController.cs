using System.Security.Claims;
using API.DTOs;
using API.Services;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[AllowAnonymous]
[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> userManager;
    private readonly SignInManager<AppUser> signInManager;
    private readonly TokenService tokenService;

    public AccountController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, TokenService tokenService)
    {
        this.userManager = userManager;
        this.signInManager = signInManager;
        this.tokenService = tokenService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDto)
    {
        var user = await userManager.FindByEmailAsync(loginDto.Email);

        if (user == null) return Unauthorized();


        var result = await signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        if (!result.Succeeded) return Unauthorized();

        return CreateUserObject(user);
    }

    [HttpPost("register")]
    public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDto)
    {
        if (await userManager.Users.AnyAsync(x => x.Email == registerDto.Email))
        {
            return BadRequest("Email already exists");
        }

        if (await userManager.Users.AnyAsync(x => x.UserName == registerDto.Username))
        {
            return BadRequest("Username already exists");
        }

        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email,
            UserName = registerDto.Username
        };

        var result = await userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded) return BadRequest("Problem registering new user");

        return CreateUserObject(user);
    }

    [Authorize]
    [HttpGet()]
    public async Task<ActionResult<UserDTO>> GetCurrentUser()
    {
        var user = await userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email).Value);

        return CreateUserObject(user);
    }


    private UserDTO CreateUserObject(AppUser user)
    {
        return new UserDTO
        {
            DisplayName = user.DisplayName,
            Image = null,
            Token = tokenService.CreateToken(user),
            Username = user.UserName
        };
    }
}
