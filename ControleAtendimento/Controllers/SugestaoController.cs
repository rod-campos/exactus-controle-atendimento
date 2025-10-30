using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
using System.Collections.Generic;

using ControleAtendimento.Data;
using ControleAtendimento.Models;
using ControleAtendimento.Dtos;

namespace ControleAtendimento.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SugestaoController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public SugestaoController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<SugestaoResponseDto>>> GetSugestoes(
        [FromQuery] bool? isRead = null,
        [FromQuery] int? clienteId = null,
        [FromQuery] int? caId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Sugestoes
            .Include(s => s.Usuario)
            .Include(s => s.Cliente)
            .Include(s => s.Ca)
            .AsQueryable();

        // If not admin, show only own suggestions
        if (!IsAdmin())
        {
            var userId = GetCurrentUserId();
            query = query.Where(s => s.UsuarioId == userId);
        }

        // Apply filters
        if (isRead.HasValue)
            query = query.Where(s => s.IsRead == isRead.Value);

        if (clienteId.HasValue)
            query = query.Where(s => s.ClienteId == clienteId.Value);

        if (caId.HasValue)
            query = query.Where(s => s.CaId == caId.Value);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(s =>
                s.Titulo.Contains(search) ||
                s.Conteudo.Contains(search) ||
                s.Usuario.NomeUsuario.Contains(search));
        }

        var totalCount = await query.CountAsync();

        var sugestoes = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SugestaoResponseDto
            {
                Id = s.Id,
                Titulo = s.Titulo,
                Conteudo = s.Conteudo,
                IsRead = s.IsRead,
                UsuarioId = s.UsuarioId,
                NomeUsuario = s.Usuario.NomeUsuario,
                EmailUsuario = s.Usuario.Email,
                ClienteId = s.ClienteId,
                NomeCliente = s.Cliente != null ? s.Cliente.NomeCliente : null,
                CodigoCliente = s.Cliente != null ? s.Cliente.CodigoCliente : null,
                CaId = s.CaId,
                NomeCa = s.Ca != null ? s.Ca.NomeCa : null,
                CodigoCa = s.Ca != null ? s.Ca.CodigoCa : null,
            })
            .ToListAsync();

        var paginado = new PaginacaoResponseDto<SugestaoResponseDto>
        {
            Dados = sugestoes,
            TotalRegistros = totalCount,
            Pagina = page,
            TamanhoPagina = pageSize,
            TotalPaginas = (int)Math.Ceiling(totalCount / (double)pageSize),
            TemProximaPagina = page * pageSize < totalCount,
            TemPaginaAnterior = page > 1
        };

        return Ok(paginado);
    }
    
    [HttpGet("{id}")]
    public async Task<ActionResult<SugestaoResponseDto>> GetSugestao(int id)
    {
        var sugestao = await _context.Sugestoes
            .Include(s => s.Usuario)
            .Include(s => s.Cliente)
            .Include(s => s.Ca)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (sugestao == null)
        {
            return NotFound(new { message = "Sugestão não encontrada" });
        }

        if (!IsAdmin() && sugestao.UsuarioId != GetCurrentUserId())
        {
            return Forbid();
        }

        return Ok(new SugestaoResponseDto
        {
            Id = sugestao.Id,
            Titulo = sugestao.Titulo,
            Conteudo = sugestao.Conteudo,
            IsRead = sugestao.IsRead,
            UsuarioId = sugestao.UsuarioId,
            NomeUsuario = sugestao.Usuario.NomeUsuario,
            EmailUsuario = sugestao.Usuario.Email,
            ClienteId = sugestao.ClienteId,
            NomeCliente = sugestao.Cliente?.NomeCliente,
            CodigoCliente = sugestao.Cliente?.CodigoCliente,
            CaId = sugestao.CaId,
            NomeCa = sugestao.Ca?.NomeCa,
            CodigoCa = sugestao.Ca?.CodigoCa,
        });
    }

    [HttpPost]
    public async Task<ActionResult<SugestaoResponseDto>> CreateSugestao(SugestaoCreateDto dto)
    {
        if (dto.ClienteId.HasValue)
        {
            var cliente = await _context.Clientes.FindAsync(dto.ClienteId.Value);
            if (cliente == null || !cliente.IsActive)
            {
                return BadRequest(new { message = "Cliente não encontrado" });
            }
        }

        if (dto.CaId.HasValue)
        {
            var ca = await _context.Cas.FindAsync(dto.CaId.Value);
            if (ca == null || !ca.IsActive)
            {
                return BadRequest(new { message = "CA não encontrada" });
            }
        }

        var currentUserId = GetCurrentUserId();

        var sugestao = new Sugestao
        {
            Titulo = dto.Titulo,
            Conteudo = dto.Conteudo,
            UsuarioId = currentUserId,
            ClienteId = dto.ClienteId,
            CaId = dto.CaId
        };

        _context.Sugestoes.Add(sugestao);
        await _context.SaveChangesAsync();

        await _context.Entry(sugestao)
            .Reference(s => s.Usuario)
            .LoadAsync();

        if (sugestao.ClienteId.HasValue)
        {
            await _context.Entry(sugestao)
                .Reference(s => s.Cliente)
                .LoadAsync();
        }

        if (sugestao.CaId.HasValue)
        {
            await _context.Entry(sugestao)
                .Reference(s => s.Ca)
                .LoadAsync();
        }

        return CreatedAtAction(nameof(GetSugestao), new { id = sugestao.Id }, new SugestaoResponseDto
        {
            Id = sugestao.Id,
            Titulo = sugestao.Titulo,
            Conteudo = sugestao.Conteudo,
            IsRead = sugestao.IsRead,
            UsuarioId = sugestao.UsuarioId,
            NomeUsuario = sugestao.Usuario.NomeUsuario,
            EmailUsuario = sugestao.Usuario.Email,
            ClienteId = sugestao.ClienteId,
            NomeCliente = sugestao.Cliente?.NomeCliente,
            CodigoCliente = sugestao.Cliente?.CodigoCliente,
            CaId = sugestao.CaId,
            NomeCa = sugestao.Ca?.NomeCa,
            CodigoCa = sugestao.Ca?.CodigoCa,
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSugestao(int id, SugestaoUpdateDto dto)
    {
        var sugestao = await _context.Sugestoes.FindAsync(id);
        if (sugestao == null)
        {
            return NotFound(new { message = "Sugestão não encontrada" });
        }

        if (!IsAdmin() && sugestao.UsuarioId != GetCurrentUserId())
        {
            return Forbid();
        }

        if (dto.ClienteId.HasValue)
        {
            var cliente = await _context.Clientes.FindAsync(dto.ClienteId.Value);
            if (cliente == null || !cliente.IsActive)
            {
                return BadRequest(new { message = "Cliente não encontrado" });
            }
        }

        if (dto.CaId.HasValue)
        {
            var ca = await _context.Cas.FindAsync(dto.CaId.Value);
            if (ca == null || !ca.IsActive)
            {
                return BadRequest(new { message = "CA não encontrada" });
            }
        }

        if (!string.IsNullOrEmpty(dto.Titulo))
            sugestao.Titulo = dto.Titulo;

        if (!string.IsNullOrEmpty(dto.Conteudo))
            sugestao.Conteudo = dto.Conteudo;

        if (dto.ClienteId.HasValue)
            sugestao.ClienteId = dto.ClienteId.Value;
        else if (dto.ClienteId == null)
            sugestao.ClienteId = null;

        if (dto.CaId.HasValue)
            sugestao.CaId = dto.CaId.Value;
        else if (dto.CaId == null)
            sugestao.CaId = null;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/read")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> MarkAsRead(int id, [FromBody] bool isRead = true)
    {
        var sugestao = await _context.Sugestoes.FindAsync(id);
        if (sugestao == null)
        {
            return NotFound(new { message = "Sugestão não encontrada" });
        }

        sugestao.IsRead = isRead;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Sugestão marcada como {(isRead ? "lida" : "não lida")}" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSugestao(int id)
    {
        var sugestao = await _context.Sugestoes.FindAsync(id);
        if (sugestao == null)
        {
            return NotFound(new { message = "Sugestão não encontrada" });
        }

        if (!IsAdmin() && sugestao.UsuarioId != GetCurrentUserId())
        {
            return Forbid();
        }

        _context.Sugestoes.Remove(sugestao);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Sugestão excluída com sucesso" });
    }

    [HttpGet("statistics")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<object>> GetStatistics()
    {
        var stats = await _context.Sugestoes
            .GroupBy(s => 1)
            .Select(g => new
            {
                TotalSugestoes = g.Count(),
                SugestoesLidas = g.Count(s => s.IsRead),
                SugestoesNaoLidas = g.Count(s => !s.IsRead),
                SugestoesHoje = g.Count(s => s.CreatedAt.Date == DateTime.Today),
                SugestoesPorUsuario = g.GroupBy(s => s.UsuarioId).Count()
            })
            .FirstOrDefaultAsync();

        return Ok(stats ?? new
        {
            TotalSugestoes = 0,
            SugestoesLidas = 0,
            SugestoesNaoLidas = 0,
            SugestoesHoje = 0,
            SugestoesPorUsuario = 0
        });
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
