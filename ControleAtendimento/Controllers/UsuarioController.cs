using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

using BCrypt.Net;

using ControleAtendimento.Data;
using ControleAtendimento.Models;
using ControleAtendimento.Dtos;

namespace ControleAtendimento.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuarioController : ControllerBase
{
    private readonly AtendimentoDbContext _context;
    private readonly IConfiguration _configuration;

    public UsuarioController(AtendimentoDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<ActionResult<object>> Login(UsuarioLoginDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower() && u.IsActive);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash))
        {
            if (usuario != null)
            {
                usuario.TentativasLogin++;
                if (usuario.TentativasLogin >= 5)
                {
                    usuario.IsActive = false;
                }
                await _context.SaveChangesAsync();
            }
            return Unauthorized(new { message = "Credenciais inválidas" });
        }

        if (!usuario.IsActive)
        {
            return Unauthorized(new { message = "Usuário inativo. Contate o administrador." });
        }

        usuario.TentativasLogin = 0;
        usuario.UltimoLogin = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(usuario);
        var refreshToken = GenerateRefreshToken(usuario.Id);

        return Ok(new
        {
            Token = token,
            RefreshToken = refreshToken.Token,
            Usuario = new UsuarioResponseDto
            {
                Id = usuario.Id,
                NomeUsuario = usuario.NomeUsuario,
                Email = usuario.Email,
                Telefone = usuario.Telefone,
                Cargo = usuario.Cargo,
                IsAdmin = usuario.IsAdmin,
                UltimoLogin = usuario.UltimoLogin,
                IsActive = usuario.IsActive
            }
        });
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshTokenResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.Usuario)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken && rt.RevogadoEm == null);
    
        if (storedToken == null || storedToken.ExpiraEm <= DateTime.UtcNow)
        {
            return Unauthorized(new { message = "Token inválido ou expirado" });
        }
    
        var usuario = storedToken.Usuario;
        if (!usuario.IsActive)
        {
            return Unauthorized(new { message = "Usuário inativo." });
        }
    
        // Revoke old token
        storedToken.RevogadoEm = DateTime.UtcNow;
    
        // Generate new tokens
        var newJwtToken = GenerateJwtToken(usuario);
        var newRefreshToken = GenerateRefreshToken(usuario.Id);
    
        await _context.SaveChangesAsync();
    
        return Ok(new RefreshTokenResponseDto
        {
            Token = newJwtToken,
            RefreshToken = newRefreshToken.Token
        });
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<PaginacaoResponseDto<UsuarioResponseDto>>> GetUsuarios(
        [FromQuery] string? search = null,
        [FromQuery] bool? isAdmin = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Usuarios
            .AsQueryable();


        if (isAdmin.HasValue)
            query = query.Where(u => u.IsAdmin == isAdmin.Value);

        if (isActive.HasValue)
            query = query.Where(u => u.IsActive == isActive.Value);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u =>
                u.NomeUsuario.Contains(search) ||
                u.Email.Contains(search) ||
                (u.Cargo != null && u.Cargo.Contains(search)));
        }

        var totalCount = await query.CountAsync();

        var usuarios = await query
            .OrderBy(u => u.NomeUsuario)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UsuarioResponseDto
            {
                Id = u.Id,
                NomeUsuario = u.NomeUsuario,
                Email = u.Email,
                Telefone = u.Telefone,
                Cargo = u.Cargo,
                IsAdmin = u.IsAdmin,
                UltimoLogin = u.UltimoLogin,
                IsActive = u.IsActive
            })
            .ToListAsync();

        var paginado = new PaginacaoResponseDto<UsuarioResponseDto>
        {
            Dados = usuarios,
            TotalRegistros = totalCount,
            Pagina = page,
            TamanhoPagina = pageSize,
            TotalPaginas = (int)Math.Ceiling(totalCount / (double)pageSize),
            TemProximaPagina = page * pageSize < totalCount,
            TemPaginaAnterior = page > 1
        };

        return Ok(paginado);
    }
    
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UsuarioResponseDto>> GetCurrentUser()
    {
        var userId = GetCurrentUserId();
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == userId && u.IsActive);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        return Ok(new UsuarioResponseDto
        {
            Id = usuario.Id,
            NomeUsuario = usuario.NomeUsuario,
            Email = usuario.Email,
            Telefone = usuario.Telefone,
            Cargo = usuario.Cargo,
            IsAdmin = usuario.IsAdmin,
            UltimoLogin = usuario.UltimoLogin,
            IsActive = usuario.IsActive
        });
    }

    [HttpGet("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UsuarioResponseDto>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);

        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        return Ok(new UsuarioResponseDto
        {
            Id = usuario.Id,
            NomeUsuario = usuario.NomeUsuario,
            Email = usuario.Email,
            Telefone = usuario.Telefone,
            Cargo = usuario.Cargo,
            IsAdmin = usuario.IsAdmin,
            UltimoLogin = usuario.UltimoLogin,
            IsActive = usuario.IsActive
        });
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UsuarioResponseDto>> CreateUsuario(UsuarioCreateDto dto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email.ToLower()))
        {
            return BadRequest(new { message = "Email já está em uso" });
        }

        var usuario = new Usuario
        {
            NomeUsuario = dto.NomeUsuario,
            Email = dto.Email.ToLower(),
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            Telefone = dto.Telefone,
            Cargo = dto.Cargo,
            IsAdmin = dto.IsAdmin
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUsuario), new { id = usuario.Id }, new UsuarioResponseDto
        {
            Id = usuario.Id,
            NomeUsuario = usuario.NomeUsuario,
            Email = usuario.Email,
            Telefone = usuario.Telefone,
            Cargo = usuario.Cargo,
            IsAdmin = usuario.IsAdmin,
            IsActive = usuario.IsActive
        });
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateUsuario(int id, UsuarioUpdateDto dto)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        if (!isAdmin && currentUserId != id)
        {
            return Forbid();
        }

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null || !usuario.IsActive)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        if (!string.IsNullOrEmpty(dto.Email) && dto.Email.ToLower() != usuario.Email)
        {
            if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email.ToLower() && u.Id != id))
            {
                return BadRequest(new { message = "Email já está em uso" });
            }
            usuario.Email = dto.Email.ToLower();
        }

        if (!string.IsNullOrEmpty(dto.NomeUsuario))
            usuario.NomeUsuario = dto.NomeUsuario;

        if (!string.IsNullOrEmpty(dto.Telefone))
            usuario.Telefone = dto.Telefone;

        if (!string.IsNullOrEmpty(dto.Cargo))
            usuario.Cargo = dto.Cargo;

        if (isAdmin && dto.IsAdmin.HasValue)
            usuario.IsAdmin = dto.IsAdmin.Value;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/reactivate")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ReactivateUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }
    
        if (usuario.IsActive)
        {
            return BadRequest(new { message = "Usuário já está ativo" });
        }
    
        usuario.IsActive = true;
        usuario.TentativasLogin = 0;
        await _context.SaveChangesAsync();
    
        return Ok(new { message = "Usuário reativado com sucesso" });
    }

    [HttpPut("{id}/password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(int id, [FromBody] string newPassword)
    {
        var currentUserId = GetCurrentUserId();
        var isAdmin = IsAdmin();

        if (!isAdmin && currentUserId != id)
        {
            return Forbid();
        }

        if (string.IsNullOrEmpty(newPassword) || newPassword.Length < 8)
        {
            return BadRequest(new { message = "Senha deve ter pelo menos 8 caracteres" });
        }

        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null || !usuario.IsActive)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Senha alterada com sucesso" });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeactivateUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null || !usuario.IsActive)
        {
            return NotFound(new { message = "Usuário não encontrado" });
        }

        // Cannot deactivate the last admin
        if (usuario.IsAdmin)
        {
            var adminCount = await _context.Usuarios.CountAsync(u => u.IsAdmin && u.IsActive);
            if (adminCount <= 1)
            {
                return BadRequest(new { message = "Não é possível desativar o último administrador" });
            }
        }

        usuario.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuário desativado com sucesso" });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var currentUserId = GetCurrentUserId();
        
        var userTokens = await _context.RefreshTokens
            .Where(rt => rt.UsuarioId == currentUserId && rt.RevogadoEm == null)
            .ToListAsync();
    
        foreach (var token in userTokens)
        {
            token.RevogadoEm = DateTime.UtcNow;
        }
    
        await _context.SaveChangesAsync();
    
        return Ok(new { 
            message = "Logout realizado com sucesso",
            revokedTokens = userTokens.Count
        });
    }

    private string GenerateJwtToken(Usuario usuario)
    {
 
        var jwtKey = _configuration["Jwt:Key"];
        var jwtIssuer = _configuration["Jwt:Issuer"];
        var jwtAudience = _configuration["Jwt:Audience"];
        

        if (string.IsNullOrEmpty(jwtKey) || jwtKey.Length < 32)
        {
            throw new InvalidOperationException("JWT key must be at least 32 characters long");
        }
        
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.NomeUsuario),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim("isAdmin", usuario.IsAdmin.ToString().ToLower()),
        };
    
        var token = new JwtSecurityToken(
            issuer: jwtIssuer,       
            audience: jwtAudience,     
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds);
    
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private RefreshToken GenerateRefreshToken(int usuarioId)
    {
        var refreshToken = new RefreshToken
        {
            Token = Guid.NewGuid().ToString(),
            UsuarioId = usuarioId,
            ExpiraEm = DateTime.UtcNow.AddDays(7),
            CriadoPorIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        };

        _context.RefreshTokens.Add(refreshToken);
        return refreshToken;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    private bool IsAdmin()
    {
        var isAdminClaim = User.FindFirst("isAdmin")?.Value;
        return bool.Parse(isAdminClaim ?? "false");
    }
}
