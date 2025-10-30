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
public class AssuntoController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public AssuntoController(AtendimentoDbContext context)
    {
        _context = context;
    }
    
    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<AssuntoResponseDto>>> GetAssuntos(
        [FromQuery] int? moduloId = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Assuntos
            .Include(a => a.Modulo)
            .AsQueryable();
        
        if (moduloId.HasValue)
            query = query.Where(a => a.ModuloId == moduloId.Value);

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(a => 
                a.TipoAssunto.Contains(search) ||
                (a.Descricao != null && a.Descricao.Contains(search)) ||
                a.Modulo.NomeModulo.Contains(search));
        }

        var totalCount = await query.CountAsync();

        var assuntos = await query
            .OrderBy(a => a.Modulo.NomeModulo)
            .ThenBy(a => a.TipoAssunto)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AssuntoResponseDto
            {
                Id = a.Id,
                TipoAssunto = a.TipoAssunto,
                ModuloId = a.ModuloId,
                Descricao = a.Descricao,
                NomeModulo = a.Modulo.NomeModulo
            })
            .ToListAsync();

        var paginado = new PaginacaoResponseDto<AssuntoResponseDto>
        {
            Dados = assuntos,
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
    public async Task<ActionResult<AssuntoResponseDto>> GetAssunto(int id)
    {
        var assunto = await _context.Assuntos
            .Include(a => a.Modulo)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assunto == null)
        {
            return NotFound(new { message = "Assunto não encontrado" });
        }

        return Ok(new AssuntoResponseDto
        {
            Id = assunto.Id,
            TipoAssunto = assunto.TipoAssunto,
            ModuloId = assunto.ModuloId,
            Descricao = assunto.Descricao,
            NomeModulo = assunto.Modulo.NomeModulo
        });
    }
    
    [HttpGet("modulo/{moduloId}")]
    public async Task<ActionResult<IEnumerable<AssuntoResponseDto>>> GetAssuntosByModulo(int moduloId)
    {
        var modulo = await _context.Modulos.FindAsync(moduloId);
        if (modulo == null)
        {
            return NotFound(new { message = "Módulo não encontrado" });
        }

        var assuntos = await _context.Assuntos
            .Include(a => a.Modulo)
            .Where(a => a.ModuloId == moduloId)
            .OrderBy(a => a.TipoAssunto)
            .Select(a => new AssuntoResponseDto
            {
                Id = a.Id,
                TipoAssunto = a.TipoAssunto,
                ModuloId = a.ModuloId,
                Descricao = a.Descricao,
                NomeModulo = a.Modulo.NomeModulo
            })
            .ToListAsync();

        return Ok(assuntos);
    }
    
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<AssuntoResponseDto>> CreateAssunto(AssuntoDto dto)
    {
        var modulo = await _context.Modulos.FindAsync(dto.ModuloId);
        if (modulo == null)
        {
            return BadRequest(new { message = "Módulo não encontrado" });
        }
        
        if (await _context.Assuntos.AnyAsync(a => 
            a.ModuloId == dto.ModuloId && 
            a.TipoAssunto == dto.TipoAssunto))
        {
            return BadRequest(new { message = $"Assunto '{dto.TipoAssunto}' já existe para este módulo" });
        }

        var assunto = new Assunto
        {
            TipoAssunto = dto.TipoAssunto,
            ModuloId = dto.ModuloId,
            Descricao = dto.Descricao
        };

        _context.Assuntos.Add(assunto);
        await _context.SaveChangesAsync();
        
        await _context.Entry(assunto)
            .Reference(a => a.Modulo)
            .LoadAsync();

        return CreatedAtAction(nameof(GetAssunto), new { id = assunto.Id }, new AssuntoResponseDto
        {
            Id = assunto.Id,
            TipoAssunto = assunto.TipoAssunto,
            ModuloId = assunto.ModuloId,
            Descricao = assunto.Descricao,
            NomeModulo = assunto.Modulo.NomeModulo
        });
    }
    
    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateAssunto(int id, AssuntoDto dto)
    {
        var assunto = await _context.Assuntos.FindAsync(id);
        if (assunto == null)
        {
            return NotFound(new { message = "Assunto não encontrado" });
        }
        
        if (dto.ModuloId != assunto.ModuloId)
        {
            var modulo = await _context.Modulos.FindAsync(dto.ModuloId);
            if (modulo == null)
            {
                return BadRequest(new { message = "Módulo não encontrado" });
            }
        }
        
        if ((dto.ModuloId != assunto.ModuloId || dto.TipoAssunto != assunto.TipoAssunto) &&
            await _context.Assuntos.AnyAsync(a => 
                a.ModuloId == dto.ModuloId && 
                a.TipoAssunto == dto.TipoAssunto && 
                a.Id != id))
        {
            return BadRequest(new { message = $"Assunto '{dto.TipoAssunto}' já existe para este módulo" });
        }

        assunto.TipoAssunto = dto.TipoAssunto;
        assunto.ModuloId = dto.ModuloId;
        assunto.Descricao = dto.Descricao;

        await _context.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteAssunto(int id)
    {
        var assunto = await _context.Assuntos
            .Include(a => a.Atendimentos.Where(at => at.IsActive))
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assunto == null)
        {
            return NotFound(new { message = "Assunto não encontrado" });
        }
        
        if (assunto.Atendimentos.Any())
        {
            return BadRequest(new { message = "Não é possível excluir assunto com atendimentos ativos" });
        }

        _context.Assuntos.Remove(assunto);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Assunto excluído com sucesso" });
    }
}
