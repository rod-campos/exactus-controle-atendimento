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
public class ModuloController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public ModuloController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<ModuloResponseDto>>> GetModulos(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Modulos.AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(m => 
                m.NomeModulo.Contains(search) ||
                (m.Descricao != null && m.Descricao.Contains(search)));
        }

        var totalCount = await query.CountAsync();
        
        var modulos = await query
            .OrderBy(m => m.NomeModulo)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new ModuloResponseDto
            {
                Id = m.Id,
                NomeModulo = m.NomeModulo,
                Descricao = m.Descricao,
                TotalAssuntos = m.Assuntos.Count()
            })
            .ToListAsync();

        var paginado = new PaginacaoResponseDto<ModuloResponseDto>
        {
            Dados = modulos,
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
    public async Task<ActionResult<ModuloResponseDto>> GetModulo(int id)
    {
        var modulo = await _context.Modulos
            .FirstOrDefaultAsync(m => m.Id == id);

        if (modulo == null)
        {
            return NotFound(new { message = "Módulo não encontrado" });
        }

        var totalAssuntos = await _context.Assuntos.CountAsync(a => a.ModuloId == id);

        return Ok(new ModuloResponseDto
        {
            Id = modulo.Id,
            NomeModulo = modulo.NomeModulo,
            Descricao = modulo.Descricao,
            TotalAssuntos = totalAssuntos
        });
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ModuloResponseDto>> CreateModulo(ModuloDto dto)
    {
        // Check if module name already exists
        if (await _context.Modulos.AnyAsync(m => m.NomeModulo == dto.NomeModulo))
        {
            return BadRequest(new { message = $"Módulo '{dto.NomeModulo}' já existe" });
        }

        var modulo = new Modulo
        {
            NomeModulo = dto.NomeModulo,
            Descricao = dto.Descricao
        };

        _context.Modulos.Add(modulo);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetModulo), new { id = modulo.Id }, new ModuloResponseDto
        {
            Id = modulo.Id,
            NomeModulo = modulo.NomeModulo,
            Descricao = modulo.Descricao,
            TotalAssuntos = 0
        });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateModulo(int id, ModuloDto dto)
    {
        var modulo = await _context.Modulos.FindAsync(id);
        if (modulo == null)
        {
            return NotFound(new { message = "Módulo não encontrado" });
        }
 
        if (dto.NomeModulo != modulo.NomeModulo && 
            await _context.Modulos.AnyAsync(m => m.NomeModulo == dto.NomeModulo && m.Id != id))
        {
            return BadRequest(new { message = $"Módulo '{dto.NomeModulo}' já existe" });
        }
  
        modulo.NomeModulo = dto.NomeModulo;
        modulo.Descricao = dto.Descricao;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteModulo(int id)
    {
        var modulo = await _context.Modulos
            .Include(m => m.Assuntos)
            .Include(m => m.Atendimentos)
            .FirstOrDefaultAsync(m => m.Id == id);

        if (modulo == null)
        {
            return NotFound(new { message = "Módulo não encontrado" });
        }

   
        if (modulo.Assuntos.Any())
        {
            return BadRequest(new { message = "Não é possível excluir módulo com assuntos cadastrados" });
        }

        if (modulo.Atendimentos.Any())
        {
            return BadRequest(new { message = "Não é possível excluir módulo com atendimentos cadastrados" });
        }

        _context.Modulos.Remove(modulo);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Módulo excluído com sucesso" });
    }

    [HttpGet("{id}/assuntos")]
    public async Task<ActionResult<IEnumerable<AssuntoResponseDto>>> GetModuloAssuntos(int id)
    {
        var modulo = await _context.Modulos.FindAsync(id);
        if (modulo == null)
        {
            return NotFound(new { message = "Módulo não encontrado" });
        }

        var assuntos = await _context.Assuntos
            .Where(a => a.ModuloId == id)
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

    [HttpGet("{id}/statistics")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<object>> GetModuloStatistics(int id)
    {
        var modulo = await _context.Modulos.FindAsync(id);
        if (modulo == null)
        {
            return NotFound(new { message = "Módulo não encontrado" });
        }

        var totalAssuntos = await _context.Assuntos.CountAsync(a => a.ModuloId == id);
        var totalAtendimentos = await _context.Atendimentos.CountAsync(a => a.ModuloId == id && a.IsActive);

        var atendimentosPorStatus = await _context.Atendimentos
            .Where(a => a.ModuloId == id && a.IsActive)
            .Include(a => a.Status)
            .GroupBy(a => a.Status.Nome)
            .Select(g => new
            {
                Status = g.Key,
                Total = g.Count()
            })
            .ToListAsync();

        return Ok(new
        {
            ModuloId = id,
            NomeModulo = modulo.NomeModulo,
            TotalAssuntos = totalAssuntos,
            TotalAtendimentos = totalAtendimentos,
            AtendimentosPorStatus = atendimentosPorStatus
        });
    }
}
