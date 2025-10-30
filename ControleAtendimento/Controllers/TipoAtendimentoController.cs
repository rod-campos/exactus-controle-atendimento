using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

using ControleAtendimento.Data;
using ControleAtendimento.Models;
using ControleAtendimento.Dtos;

namespace ControleAtendimento.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TipoAtendimentoController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public TipoAtendimentoController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<TipoAtendimentoResponseDto>>> GetTiposAtendimento(
        [FromQuery] int? prioridade = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.TiposAtendimento.AsQueryable();

        if (prioridade.HasValue)
            query = query.Where(t => t.Prioridade == prioridade.Value);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(t => 
                t.Nome.Contains(search) ||
                (t.Descricao != null && t.Descricao.Contains(search)));
        }

        var totalCount = await query.CountAsync();

        var tipos = await query
            .OrderByDescending(t => t.Prioridade)
            .ThenBy(t => t.Nome)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TipoAtendimentoResponseDto
            {
                Id = t.Id,
                Nome = t.Nome,
                Descricao = t.Descricao,
                Prioridade = t.Prioridade
            })
            .ToListAsync();

        var paginado = new PaginacaoResponseDto<TipoAtendimentoResponseDto>
        {
            Dados = tipos,
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
    public async Task<ActionResult<TipoAtendimentoResponseDto>> GetTipoAtendimento(int id)
    {
        var tipo = await _context.TiposAtendimento
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tipo == null)
        {
            return NotFound(new { message = "Tipo de atendimento não encontrado" });
        }

        return Ok(new TipoAtendimentoResponseDto
        {
            Id = tipo.Id,
            Nome = tipo.Nome,
            Descricao = tipo.Descricao,
            Prioridade = tipo.Prioridade
        });
    }

    [HttpGet("prioridades")]
    public ActionResult<IEnumerable<object>> GetPrioridades()
    {
        var prioridades = new[]
        {
            new { Value = 1, Label = "Baixa" },
            new { Value = 2, Label = "Normal" },
            new { Value = 3, Label = "Alta" },
            new { Value = 4, Label = "Urgente" }
        };

        return Ok(prioridades);
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<TipoAtendimentoResponseDto>> CreateTipoAtendimento(TipoAtendimentoDto dto)
    {
     
        if (await _context.TiposAtendimento.AnyAsync(t => t.Nome == dto.Nome))
        {
            return BadRequest(new { message = $"Tipo de atendimento '{dto.Nome}' já existe" });
        }

     
        if (dto.Prioridade < 1 || dto.Prioridade > 4)
        {
            return BadRequest(new { message = "Prioridade deve ser entre 1 (Baixa) e 4 (Urgente)" });
        }

        var tipo = new TipoAtendimento
        {
            Nome = dto.Nome,
            Descricao = dto.Descricao,
            Prioridade = dto.Prioridade
        };

        _context.TiposAtendimento.Add(tipo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTipoAtendimento), new { id = tipo.Id }, new TipoAtendimentoResponseDto
        {
            Id = tipo.Id,
            Nome = tipo.Nome,
            Descricao = tipo.Descricao,
            Prioridade = tipo.Prioridade
        });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateTipoAtendimento(int id, TipoAtendimentoDto dto)
    {
        var tipo = await _context.TiposAtendimento.FindAsync(id);
        if (tipo == null)
        {
            return NotFound(new { message = "Tipo de atendimento não encontrado" });
        }

        if (dto.Nome != tipo.Nome &&
            await _context.TiposAtendimento.AnyAsync(t => t.Nome == dto.Nome && t.Id != id))
        {
            return BadRequest(new { message = $"Tipo de atendimento '{dto.Nome}' já existe" });
        }

        if (dto.Prioridade < 1 || dto.Prioridade > 4)
        {
            return BadRequest(new { message = "Prioridade deve ser entre 1 (Baixa) e 4 (Urgente)" });
        }

        tipo.Nome = dto.Nome;
        tipo.Descricao = dto.Descricao;
        tipo.Prioridade = dto.Prioridade;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteTipoAtendimento(int id)
    {
        var tipo = await _context.TiposAtendimento
            .Include(t => t.Atendimentos.Where(a => a.IsActive))
            .FirstOrDefaultAsync(t => t.Id == id);

        if (tipo == null)
        {
            return NotFound(new { message = "Tipo de atendimento não encontrado" });
        }

        if (tipo.Atendimentos.Any())
        {
            return BadRequest(new { message = "Não é possível excluir tipo de atendimento com atendimentos ativos" });
        }

        _context.TiposAtendimento.Remove(tipo);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tipo de atendimento excluído com sucesso" });
    }

    [HttpGet("statistics")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<object>> GetStatistics()
    {
        var stats = await _context.TiposAtendimento
            .Select(t => new
            {
                t.Id,
                t.Nome,
                t.Prioridade,
                TotalAtendimentos = t.Atendimentos.Count(a => a.IsActive),
                AtendimentosAbertos = t.Atendimentos.Count(a => a.IsActive && a.Status.Nome == "Aberto"),
                AtendimentosEmAndamento = t.Atendimentos.Count(a => a.IsActive && a.Status.Nome == "Em Andamento"),
                AtendimentosResolvidos = t.Atendimentos.Count(a => a.IsActive && a.Status.Nome == "Resolvido")
            })
            .OrderByDescending(s => s.TotalAtendimentos)
            .ToListAsync();

        return Ok(stats);
    }
}
