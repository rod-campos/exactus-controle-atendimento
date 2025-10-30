using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;

using ControleAtendimento.Data;
using ControleAtendimento.Models;
using ControleAtendimento.Dtos;

namespace ControleAtendimento.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CaController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public CaController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<CaResponseDto>>> GetCas(
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Cas.Where(c => c.IsActive).AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => 
                c.CodigoCa.Contains(search) ||
                c.NomeCa.Contains(search) ||
                (c.Cidade != null && c.Cidade.Contains(search)));
        }

        var totalCount = await query.CountAsync();
        
        var cas = await query
            .OrderBy(c => c.CodigoCa)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CaResponseDto
            {
                Id = c.Id,
                CodigoCa = c.CodigoCa,
                NomeCa = c.NomeCa,
                Cidade = c.Cidade,
                Uf = c.Uf,
                Telefone = c.Telefone,
                Email = c.Email,
                Responsavel = c.Responsavel,
                IsActive = c.IsActive,
                TotalClientes = c.Clientes.Count(cl => cl.IsActive),
                TotalAtendimentos = c.Atendimentos.Count(a => a.IsActive)
            })
            .ToListAsync();

        var paginado = new PaginacaoResponseDto<CaResponseDto>
        {
            Dados = cas,
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
    public async Task<ActionResult<CaResponseDto>> GetCa(int id)
    {
        var ca = await _context.Cas
            .Where(c => c.IsActive)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (ca == null)
        {
            return NotFound(new { message = "CA não encontrada" });
        }

        return Ok(new CaResponseDto
        {
            Id = ca.Id,
            CodigoCa = ca.CodigoCa,
            NomeCa = ca.NomeCa,
            Cidade = ca.Cidade,
            Uf = ca.Uf,
            Telefone = ca.Telefone,
            Email = ca.Email,
            Responsavel = ca.Responsavel,
            IsActive = ca.IsActive
        });
    }

    [HttpGet("codigo/{codigo}")]
    public async Task<ActionResult<CaResponseDto>> GetCaByCodigo(string codigo)
    {
        var ca = await _context.Cas
            .Where(c => c.IsActive && c.CodigoCa == codigo)
            .FirstOrDefaultAsync();

        if (ca == null)
        {
            return NotFound(new { message = $"CA com código {codigo} não encontrada" });
        }

        return Ok(new CaResponseDto
        {
            Id = ca.Id,
            CodigoCa = ca.CodigoCa,
            NomeCa = ca.NomeCa,
            Cidade = ca.Cidade,
            Uf = ca.Uf,
            Telefone = ca.Telefone,
            Email = ca.Email,
            Responsavel = ca.Responsavel,
            IsActive = ca.IsActive
        });
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CaResponseDto>> CreateCa(CaDto dto)
    {
    
        if (await _context.Cas.AnyAsync(c => c.CodigoCa == dto.CodigoCa))
        {
            return BadRequest(new { message = $"Código {dto.CodigoCa} já existe" });
        }

        var ca = new Ca
        {
            CodigoCa = dto.CodigoCa,
            NomeCa = dto.NomeCa,
            Cidade = dto.Cidade,
            Uf = dto.Uf?.ToUpper(),
            Telefone = dto.Telefone,
            Email = dto.Email?.ToLower(),
            Responsavel = dto.Responsavel
        };

        _context.Cas.Add(ca);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCa), new { id = ca.Id }, new CaResponseDto
        {
            Id = ca.Id,
            CodigoCa = ca.CodigoCa,
            NomeCa = ca.NomeCa,
            Cidade = ca.Cidade,
            Uf = ca.Uf,
            Telefone = ca.Telefone,
            Email = ca.Email,
            Responsavel = ca.Responsavel,
            IsActive = ca.IsActive
        });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateCa(int id, CaDto dto)
    {
        var ca = await _context.Cas.FindAsync(id);
        if (ca == null || !ca.IsActive)
        {
            return NotFound(new { message = "CA não encontrada" });
        }

        if (dto.CodigoCa != ca.CodigoCa && await _context.Cas.AnyAsync(c => c.CodigoCa == dto.CodigoCa && c.Id != id))
        {
            return BadRequest(new { message = $"Código {dto.CodigoCa} já existe" });
        }

        ca.CodigoCa = dto.CodigoCa;
        ca.NomeCa = dto.NomeCa;
        ca.Cidade = dto.Cidade;
        ca.Uf = dto.Uf?.ToUpper();
        ca.Telefone = dto.Telefone;
        ca.Email = dto.Email?.ToLower();
        ca.Responsavel = dto.Responsavel;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteCa(int id)
    {
        var ca = await _context.Cas
            .Include(c => c.Clientes.Where(cl => cl.IsActive))
            .FirstOrDefaultAsync(c => c.Id == id);

        if (ca == null || !ca.IsActive)
        {
            return NotFound(new { message = "CA não encontrada" });
        }

        if (ca.Clientes.Any())
        {
            return BadRequest(new { message = "Não é possível excluir CA com clientes ativos" });
        }

        ca.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "CA excluída com sucesso" });
    }

    [HttpGet("{id}/clientes")]
    public async Task<ActionResult<IEnumerable<ClienteResponseDto>>> GetCaClientes(int id)
    {
        var ca = await _context.Cas.FindAsync(id);
        if (ca == null || !ca.IsActive)
        {
            return NotFound(new { message = "CA não encontrada" });
        }

        var clientes = await _context.Clientes
            .Where(c => c.CaId == id && c.IsActive)
            .OrderBy(c => c.CodigoCliente)
            .Select(c => new ClienteResponseDto
            {
                Id = c.Id,
                CodigoCliente = c.CodigoCliente,
                CaId = c.CaId,
                NomeCliente = c.NomeCliente,
                RazaoSocial = c.RazaoSocial,
                CnpjCpf = c.CnpjCpf,
                Cidade = c.Cidade,
                Uf = c.Uf,
                Telefone = c.Telefone,
                Email = c.Email,
                Responsavel = c.Responsavel,
                StatusCliente = c.StatusCliente,
                IsActive = c.IsActive,
                NomeCa = c.Ca.NomeCa,
                CodigoCa = c.Ca.CodigoCa,
                TotalAtendimentos = c.Atendimentos.Count(a => a.IsActive)
            })
            .ToListAsync();

        return Ok(clientes);
    }
}
