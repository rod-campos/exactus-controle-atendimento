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
public class ClienteController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public ClienteController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<ClienteResponseDto>>> GetClientes(
        [FromQuery] string? search = null,
        [FromQuery] int? caId = null,
        [FromQuery] string? status = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Clientes
            .Include(c => c.Ca)
            .Where(c => c.IsActive)
            .AsQueryable();
    
        if (caId.HasValue)
            query = query.Where(c => c.CaId == caId.Value);
    
        if (!string.IsNullOrEmpty(status))
            query = query.Where(c => c.StatusCliente == status.ToUpper());
    
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(c => 
                c.CodigoCliente.Contains(search) ||
                c.NomeCliente.Contains(search) ||
                c.Email!.Contains(search) ||
                c.Ca.NomeCa.Contains(search) ||
                c.Ca.CodigoCa.Contains(search));
        }
    
        var totalCount = await query.CountAsync();
        
        var clientes = await query
            .OrderBy(c => c.Ca.CodigoCa)
            .ThenBy(c => c.CodigoCliente)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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
    
        var paginado = new PaginacaoResponseDto<ClienteResponseDto>
        {
            Dados = clientes,
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
    public async Task<ActionResult<ClienteResponseDto>> GetCliente(int id)
    {
        var cliente = await _context.Clientes
            .Include(c => c.Ca)
            .Where(c => c.IsActive)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cliente == null)
        {
            return NotFound(new { message = "Cliente não encontrado" });
        }


        return Ok(new
        {
            cliente.Id,
            cliente.CodigoCliente,
            cliente.NomeCliente,
            cliente.RazaoSocial,
            cliente.CnpjCpf,
            cliente.Cidade,
            cliente.Uf,
            cliente.Telefone,
            cliente.Email,
            cliente.Responsavel,
            cliente.StatusCliente,
            cliente.CreatedAt,
            cliente.UpdatedAt,
            Ca = new { cliente.Ca.Id, cliente.Ca.CodigoCa, cliente.Ca.NomeCa }
        });
    }

    [HttpGet("ca/{caId}/codigo/{codigo}")]
    public async Task<ActionResult<object>> GetClienteByCodigo(int caId, string codigo)
    {
        var cliente = await _context.Clientes
            .Include(c => c.Ca)
            .Where(c => c.IsActive && c.CaId == caId && c.CodigoCliente == codigo)
            .FirstOrDefaultAsync();

        if (cliente == null)
        {
            return NotFound(new { message = $"Cliente {codigo} não encontrado na CA {caId}" });
        }

        return Ok(new
        {
            cliente.Id,
            cliente.CodigoCliente,
            cliente.NomeCliente,
            cliente.StatusCliente,
            cliente.Telefone,
            cliente.Email,
            Ca = new { cliente.Ca.CodigoCa, cliente.Ca.NomeCa }
        });
    }

    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<object>> CreateCliente(ClienteDto dto)
    {
        var ca = await _context.Cas.FindAsync(dto.CaId);
        if (ca == null || !ca.IsActive)
        {
            return BadRequest(new { message = "CA não encontrada" });
        }

        // Check if client code already exists for this CA
        if (await _context.Clientes.AnyAsync(c => c.CaId == dto.CaId && c.CodigoCliente == dto.CodigoCliente))
        {
            return BadRequest(new { message = $"Código {dto.CodigoCliente} já existe para esta CA" });
        }

        var cliente = new Cliente
        {
            CodigoCliente = dto.CodigoCliente,
            CaId = dto.CaId,
            NomeCliente = dto.NomeCliente,
            RazaoSocial = dto.RazaoSocial,
            CnpjCpf = dto.CnpjCpf,
            Cidade = dto.Cidade,
            Uf = dto.Uf?.ToUpper(),
            Telefone = dto.Telefone,
            Email = dto.Email?.ToLower(),
            Responsavel = dto.Responsavel,
            StatusCliente = dto.StatusCliente.ToUpper()
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, new
        {
            cliente.Id,
            cliente.CodigoCliente,
            cliente.NomeCliente,
            message = "Cliente criado com sucesso"
        });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateCliente(int id, ClienteDto dto)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null || !cliente.IsActive)
        {
            return NotFound(new { message = "Cliente não encontrado" });
        }

        if (dto.CaId != cliente.CaId)
        {
            var newCa = await _context.Cas.FindAsync(dto.CaId);
            if (newCa == null || !newCa.IsActive)
            {
                return BadRequest(new { message = "Nova CA não encontrada" });
            }
        }

        if ((dto.CaId != cliente.CaId || dto.CodigoCliente != cliente.CodigoCliente) &&
            await _context.Clientes.AnyAsync(c => c.CaId == dto.CaId && c.CodigoCliente == dto.CodigoCliente && c.Id != id))
        {
            return BadRequest(new { message = $"Código {dto.CodigoCliente} já existe para esta CA" });
        }

        cliente.CodigoCliente = dto.CodigoCliente;
        cliente.CaId = dto.CaId;
        cliente.NomeCliente = dto.NomeCliente;
        cliente.RazaoSocial = dto.RazaoSocial;
        cliente.CnpjCpf = dto.CnpjCpf;
        cliente.Cidade = dto.Cidade;
        cliente.Uf = dto.Uf?.ToUpper();
        cliente.Telefone = dto.Telefone;
        cliente.Email = dto.Email?.ToLower();
        cliente.Responsavel = dto.Responsavel;
        cliente.StatusCliente = dto.StatusCliente.ToUpper();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> ChangeStatus(int id, [FromBody] string novoStatus)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente == null || !cliente.IsActive)
        {
            return NotFound(new { message = "Cliente não encontrado" });
        }

        var validStatuses = new[] { "ATIVO", "INATIVO", "SUSPENSO" };
        if (!validStatuses.Contains(novoStatus.ToUpper()))
        {
            return BadRequest(new { message = "Status inválido. Use: ATIVO, INATIVO ou SUSPENSO" });
        }

        cliente.StatusCliente = novoStatus.ToUpper();
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Status alterado para {novoStatus.ToUpper()}" });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> DeleteCliente(int id)
    {
        var cliente = await _context.Clientes
            .Include(c => c.Atendimentos.Where(a => a.IsActive))
            .FirstOrDefaultAsync(c => c.Id == id);

        if (cliente == null || !cliente.IsActive)
        {
            return NotFound(new { message = "Cliente não encontrado" });
        }

        // Check if client has active atendimentos
        if (cliente.Atendimentos.Any())
        {
            return BadRequest(new { message = "Não é possível excluir cliente com atendimentos ativos" });
        }

        cliente.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cliente excluído com sucesso" });
    }

    [HttpGet("statuses")]
    public ActionResult<IEnumerable<object>> GetClienteStatuses()
    {
        var statuses = new[]
        {
            new { Value = "ATIVO", Label = "Ativo" },
            new { Value = "INATIVO", Label = "Inativo" },
            new { Value = "SUSPENSO", Label = "Suspenso" }
        };

        return Ok(statuses);
    }
}
