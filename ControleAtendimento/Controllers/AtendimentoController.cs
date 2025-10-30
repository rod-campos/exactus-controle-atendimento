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
public class AtendimentoController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public AtendimentoController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<PaginacaoResponseDto<AtendimentoResponseDto>>> GetAtendimentos(
        [FromQuery] int? caId = null,
        [FromQuery] int? clienteId = null,
        [FromQuery] int? statusId = null,
        [FromQuery] string? search = null,
        [FromQuery] DateTime? dataInicio = null,
        [FromQuery] DateTime? dataFim = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Atendimentos
            .Include(a => a.Ca)
            .Include(a => a.Cliente)
            .Include(a => a.Usuario)
            .Include(a => a.Assunto)
            .Include(a => a.TipoAtendimento)
            .Include(a => a.Status)
            .Include(a => a.Modulo)
            .Where(a => a.IsActive)
            .AsQueryable();
    
        if (caId.HasValue)
            query = query.Where(a => a.CaId == caId.Value);
    
        if (clienteId.HasValue)
            query = query.Where(a => a.ClienteId == clienteId.Value);
    
        if (statusId.HasValue)
            query = query.Where(a => a.StatusId == statusId.Value);
    
        if (dataInicio.HasValue)
            query = query.Where(a => a.DataInicio >= dataInicio.Value);
    
        if (dataFim.HasValue)
            query = query.Where(a => a.DataInicio <= dataFim.Value);
    
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(a => 
                a.NumeroTicket.Contains(search) ||
                a.Titulo.Contains(search) ||
                a.Descricao.Contains(search) ||
                a.Cliente.NomeCliente.Contains(search) ||
                a.Ca.NomeCa.Contains(search));
        }
    
        // Se não for adm, mostra apenas os próprios tickets
        if (!IsAdmin())
        {
            var userId = GetCurrentUserId();
            query = query.Where(a => a.UsuarioId == userId);
        }
    
        var totalCount = await query.CountAsync();
        
        var atendimentos = await query
            .OrderByDescending(a => a.DataInicio)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AtendimentoResponseDto
            {
                Id = a.Id,
                NumeroTicket = a.NumeroTicket,
                Titulo = a.Titulo,
                Descricao = a.Descricao,
                Solucao = a.Solucao,
                DataInicio = a.DataInicio,
                DataFim = a.DataFim,
                Observacoes = a.Observacoes,
                Ca = new CaBasicDto 
                { 
                    Id = a.Ca.Id, 
                    CodigoCa = a.Ca.CodigoCa, 
                    NomeCa = a.Ca.NomeCa,
                    Cidade = a.Ca.Cidade,
                    Uf = a.Ca.Uf
                },
                Cliente = new ClienteBasicDto 
                { 
                    Id = a.Cliente.Id, 
                    CodigoCliente = a.Cliente.CodigoCliente, 
                    NomeCliente = a.Cliente.NomeCliente,
                    StatusCliente = a.Cliente.StatusCliente,
                    Telefone = a.Cliente.Telefone,
                    Email = a.Cliente.Email
                },
                Usuario = new UsuarioBasicDto 
                { 
                    Id = a.Usuario.Id, 
                    NomeUsuario = a.Usuario.NomeUsuario, 
                    Email = a.Usuario.Email,
                    Cargo = a.Usuario.Cargo
                },
                Assunto = new AssuntoBasicDto 
                { 
                    Id = a.Assunto.Id, 
                    TipoAssunto = a.Assunto.TipoAssunto,
                    Descricao = a.Assunto.Descricao
                },
                TipoAtendimento = new TipoAtendimentoBasicDto 
                { 
                    Id = a.TipoAtendimento.Id, 
                    Nome = a.TipoAtendimento.Nome,
                    Prioridade = a.TipoAtendimento.Prioridade
                },
                Modulo = new ModuloBasicDto 
                { 
                    Id = a.Modulo.Id, 
                    NomeModulo = a.Modulo.NomeModulo,
                    Descricao = a.Modulo.Descricao
                },
                Status = new StatusAtendimentoBasicDto 
                { 
                    Id = a.Status.Id, 
                    Nome = a.Status.Nome, 
                    IsFinal = a.Status.IsFinal
                }
            })
            .ToListAsync();
    
        var paginado = new PaginacaoResponseDto<AtendimentoResponseDto>
        {
            Dados = atendimentos,
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
    public async Task<ActionResult<AtendimentoResponseDto>> GetAtendimento(int id)
    {
        var atendimento = await _context.Atendimentos
            .Include(a => a.Ca)
            .Include(a => a.Cliente)
            .Include(a => a.Usuario)
            .Include(a => a.Assunto)
            .Include(a => a.TipoAtendimento)
            .Include(a => a.Status)
            .Include(a => a.Modulo)
            .Where(a => a.IsActive)
            .FirstOrDefaultAsync(a => a.Id == id);
    
        if (atendimento == null)
        {
            return NotFound(new { message = "Atendimento não encontrado" });
        }
    
        if (!IsAdmin() && atendimento.UsuarioId != GetCurrentUserId())
        {
            return Forbid();
        }
    
        var response = new AtendimentoResponseDto
        {
            Id = atendimento.Id,
            NumeroTicket = atendimento.NumeroTicket,
            Titulo = atendimento.Titulo,
            Descricao = atendimento.Descricao,
            Solucao = atendimento.Solucao,
            DataInicio = atendimento.DataInicio,
            DataFim = atendimento.DataFim,
            Observacoes = atendimento.Observacoes,
            Ca = new CaBasicDto
            {
                Id = atendimento.Ca.Id,
                CodigoCa = atendimento.Ca.CodigoCa,
                NomeCa = atendimento.Ca.NomeCa,
                Cidade = atendimento.Ca.Cidade,
                Uf = atendimento.Ca.Uf
            },
            Cliente = new ClienteBasicDto
            {
                Id = atendimento.Cliente.Id,
                CodigoCliente = atendimento.Cliente.CodigoCliente,
                NomeCliente = atendimento.Cliente.NomeCliente,
                StatusCliente = atendimento.Cliente.StatusCliente,
                Telefone = atendimento.Cliente.Telefone,
                Email = atendimento.Cliente.Email
            },
            Usuario = new UsuarioBasicDto
            {
                Id = atendimento.Usuario.Id,
                NomeUsuario = atendimento.Usuario.NomeUsuario,
                Email = atendimento.Usuario.Email,
                Cargo = atendimento.Usuario.Cargo
            },
            Assunto = new AssuntoBasicDto
            {
                Id = atendimento.Assunto.Id,
                TipoAssunto = atendimento.Assunto.TipoAssunto,
                Descricao = atendimento.Assunto.Descricao
            },
            TipoAtendimento = new TipoAtendimentoBasicDto
            {
                Id = atendimento.TipoAtendimento.Id,
                Nome = atendimento.TipoAtendimento.Nome,
                Prioridade = atendimento.TipoAtendimento.Prioridade
            },
            Modulo = new ModuloBasicDto
            {
                Id = atendimento.Modulo.Id,
                NomeModulo = atendimento.Modulo.NomeModulo,
                Descricao = atendimento.Modulo.Descricao
            },
            Status = new StatusAtendimentoBasicDto
            {
                Id = atendimento.Status.Id,
                Nome = atendimento.Status.Nome,
                IsFinal = atendimento.Status.IsFinal
            }
        };
    
        return Ok(response);
    }
    
    [HttpPost]
    public async Task<ActionResult<AtendimentoResponseDto>> CreateAtendimento(AtendimentoCreateDto dto)
    {
        if (!await ValidateForeignKeys(dto))
        {
            return BadRequest(new { message = "Dados de referência inválidos" });
        }
    
        var currentUserId = GetCurrentUserId();
    
        var ticketPrefix = await GetTicketPrefix();
        var nextNumber = await GetNextTicketNumber();
        var numeroTicket = $"{ticketPrefix}{nextNumber:D6}";
    
        var atendimento = new Atendimento
        {
            NumeroTicket = numeroTicket,
            CaId = dto.CaId,
            ClienteId = dto.ClienteId,
            UsuarioId = IsAdmin() && dto.UsuarioId.HasValue ? dto.UsuarioId.Value : currentUserId,
            AssuntoId = dto.AssuntoId,
            TipoAtendimentoId = dto.TipoAtendimentoId,
            ModuloId = dto.ModuloId,
            // Aberto
            StatusId = 1,
            Titulo = dto.Titulo,
            Descricao = dto.Descricao,
            DataInicio = DateTime.UtcNow
        };
    
        _context.Atendimentos.Add(atendimento);
        await _context.SaveChangesAsync();
    
        var response = new
        {
            Id = atendimento.Id,
            NumeroTicket = atendimento.NumeroTicket,
            Titulo = atendimento.Titulo,
            Message = "Atendimento criado com sucesso"
        };
    
        return CreatedAtAction(nameof(GetAtendimento), new { id = atendimento.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAtendimento(int id, AtendimentoUpdateDto dto)
    {
        var atendimento = await _context.Atendimentos.FindAsync(id);
        if (atendimento == null || !atendimento.IsActive)
        {
            return NotFound(new { message = "Atendimento não encontrado" });
        }
    
        if (!IsAdmin() && atendimento.UsuarioId != GetCurrentUserId())
        {
            return Forbid();
        }
    
        if (!string.IsNullOrEmpty(dto.Titulo))
            atendimento.Titulo = dto.Titulo;
    
        if (!string.IsNullOrEmpty(dto.Descricao))
            atendimento.Descricao = dto.Descricao;
    
        if (!string.IsNullOrEmpty(dto.Solucao))
            atendimento.Solucao = dto.Solucao;
    
        if (!string.IsNullOrEmpty(dto.Observacoes))
            atendimento.Observacoes = dto.Observacoes;
    
        if (dto.ModuloId.HasValue)
            atendimento.ModuloId = dto.ModuloId.Value;
    
        if (dto.DataInicio.HasValue)
            atendimento.DataInicio = dto.DataInicio.Value;
    
        // Apenas Adm pode mudar o usuário
        if (IsAdmin())
        {
            if (dto.UsuarioId.HasValue)
                atendimento.UsuarioId = dto.UsuarioId.Value;
        }
    
        if (dto.StatusId.HasValue)
        {
            atendimento.StatusId = dto.StatusId.Value;
                
            // Se o atendimento terminou, coloca data final
            var status = await _context.StatusAtendimentos.FindAsync(dto.StatusId.Value);
            if (status?.IsFinal == true && atendimento.DataFim == null)
            {
                atendimento.DataFim = DateTime.UtcNow;
            }
        }
    
        if (dto.DataFim.HasValue)
            atendimento.DataFim = dto.DataFim.Value;
    
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAtendimento(int id)
    {
        var atendimento = await _context.Atendimentos.FindAsync(id);
        if (atendimento == null || !atendimento.IsActive)
        {
            return NotFound(new { message = "Atendimento não encontrado" });
        }

        atendimento.IsActive = false;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Atendimento excluído com sucesso" });
    }

    [HttpGet("statistics")]
    public async Task<ActionResult<object>> GetStatistics()
    {
        var query = _context.Atendimentos.Where(a => a.IsActive);

        // Se não for Adm, mostra apenas os próprios stats
        if (!IsAdmin())
        {
            var userId = GetCurrentUserId();
            query = query.Where(a => a.UsuarioId == userId);
        }

        var stats = await query
            .Include(a => a.Status)
            .GroupBy(a => 1)
            .Select(g => new
            {
                TotalAtendimentos = g.Count(),
                Abertos = g.Count(a => a.Status.Nome == "Aberto"),
                EmAndamento = g.Count(a => a.Status.Nome == "Em Andamento"),
                Resolvidos = g.Count(a => a.Status.Nome == "Resolvido"),
                Cancelados = g.Count(a => a.Status.Nome == "Cancelado")
            })
            .FirstOrDefaultAsync();

        return Ok(stats ?? new
        {
            TotalAtendimentos = 0,
            Abertos = 0,
            EmAndamento = 0,
            Resolvidos = 0,
            Cancelados = 0
        });
    }

    private async Task<bool> ValidateForeignKeys(AtendimentoCreateDto dto)
    {
        if (!await _context.Cas.AnyAsync(c => c.Id == dto.CaId && c.IsActive))
            return false;
 
        if (!await _context.Clientes.AnyAsync(c => c.Id == dto.ClienteId && c.CaId == dto.CaId && c.IsActive))
            return false;

        if (!await _context.Assuntos.AnyAsync(a => a.Id == dto.AssuntoId))
            return false;

        if (!await _context.TiposAtendimento.AnyAsync(t => t.Id == dto.TipoAtendimentoId))
            return false;

        if (!await _context.Modulos.AnyAsync(m => m.Id == dto.ModuloId))
            return false;

        if (dto.UsuarioId.HasValue && IsAdmin())
        {
            if (!await _context.Usuarios.AnyAsync(u => u.Id == dto.UsuarioId.Value && u.IsActive))
                return false;
        }

        return true;
    }

    private static string GetPrioridadeTexto(int prioridade) => prioridade switch
    {
        1 => "Baixa",
        2 => "Normal", 
        3 => "Alta",
        4 => "Urgente",
        _ => "Desconhecida"
    };

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

    private async Task<string> GetTicketPrefix()
    {
        var config = await _context.Configuracoes
            .FirstOrDefaultAsync(c => c.Chave == "TICKET_PREFIXO");
        return config?.Valor ?? "ATD";
    }
    
    private async Task<int> GetNextTicketNumber()
    {
        var lastTicket = await _context.Atendimentos
            .OrderByDescending(a => a.Id)
            .FirstOrDefaultAsync();
        
        if (lastTicket == null)
            return 1;
        
        var prefix = await GetTicketPrefix();
        if (lastTicket.NumeroTicket.StartsWith(prefix))
        {
            var numberPart = lastTicket.NumeroTicket.Substring(prefix.Length);
            if (int.TryParse(numberPart, out int lastNumber))
            {
                return lastNumber + 1;
            }
        }
        
        return await _context.Atendimentos.CountAsync() + 1;
    }
}
