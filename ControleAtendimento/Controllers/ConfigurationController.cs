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

namespace ControleAtendimento.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConfigurationController : ControllerBase
{
    private readonly AtendimentoDbContext _context;

    public ConfigurationController(AtendimentoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<IEnumerable<object>>> GetConfigurations()
    {
        var configurations = await _context.Configuracoes
            .OrderBy(c => c.Chave)
            .Select(c => new
            {
                c.Id,
                c.Chave,
                c.Valor,
                c.Descricao,
                c.Tipo,
                c.Editavel
            })
            .ToListAsync();

        return Ok(configurations);
    }

    [HttpGet("{chave}")]
    public async Task<ActionResult<object>> GetConfiguration(string chave)
    {
        if (!IsAdmin() && !IsPublicConfig(chave))
        {
            return Forbid();
        }

        var config = await _context.Configuracoes
            .FirstOrDefaultAsync(c => c.Chave == chave.ToUpper());

        if (config == null)
        {
            return NotFound(new { message = "Configuração não encontrada" });
        }

        return Ok(new { chave = config.Chave, valor = config.Valor });
    }

    [HttpPut("{chave}")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<IActionResult> UpdateConfiguration(string chave, [FromBody] string valor)
    {
        var config = await _context.Configuracoes
            .FirstOrDefaultAsync(c => c.Chave == chave.ToUpper());

        if (config == null)
        {
            return NotFound(new { message = "Configuração não encontrada" });
        }

        if (!config.Editavel)
        {
            return BadRequest(new { message = "Esta configuração não pode ser editada" });
        }

        if (string.IsNullOrEmpty(valor))
        {
            return BadRequest(new { message = "Valor não pode ser vazio" });
        }


        if (config.Tipo == "NUMBER" && !decimal.TryParse(valor, out _))
        {
            return BadRequest(new { message = "Valor deve ser um número válido" });
        }

        if (config.Tipo == "BOOLEAN" && !bool.TryParse(valor, out _))
        {
            return BadRequest(new { message = "Valor deve ser 'true' ou 'false'" });
        }

        config.Valor = valor;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Configuração atualizada com sucesso" });
    }

    [HttpGet("public")]
    public async Task<ActionResult<object>> GetPublicConfigurations()
    {
        var publicKeys = new[]
        {
            "SISTEMA_NOME",
            "SISTEMA_VERSAO", 
            "TICKET_PREFIXO",
            "SESSAO_TIMEOUT_MINUTOS"
        };

        var configs = await _context.Configuracoes
            .Where(c => publicKeys.Contains(c.Chave))
            .ToDictionaryAsync(c => c.Chave, c => c.Valor);

        return Ok(configs);
    }

    [HttpGet("system-info")]
    public async Task<ActionResult<object>> GetSystemInfo()
    {
        var systemName = await GetConfigValue("SISTEMA_NOME") ?? "Sistema de Atendimento";
        var systemVersion = await GetConfigValue("SISTEMA_VERSAO") ?? "1.0.0";

        var stats = await _context.Atendimentos
            .Where(a => a.IsActive)
            .GroupBy(a => 1)
            .Select(g => new
            {
                TotalTickets = g.Count(),
                TicketsHoje = g.Count(a => a.CreatedAt.Date == DateTime.Today),
                UsuariosAtivos = _context.Usuarios.Count(u => u.IsActive)
            })
            .FirstOrDefaultAsync();

        return Ok(new
        {
            SystemName = systemName,
            Version = systemVersion,
            ServerTime = DateTime.UtcNow,
            Statistics = stats ?? new { TotalTickets = 0, TicketsHoje = 0, UsuariosAtivos = 0 }
        });
    }

    private async Task<string?> GetConfigValue(string chave)
    {
        var config = await _context.Configuracoes
            .FirstOrDefaultAsync(c => c.Chave == chave.ToUpper());
        return config?.Valor;
    }

    private static bool IsPublicConfig(string chave)
    {
        var publicConfigs = new[]
        {
            "SISTEMA_NOME",
            "SISTEMA_VERSAO",
            "TICKET_PREFIXO", 
            "SESSAO_TIMEOUT_MINUTOS"
        };

        return publicConfigs.Contains(chave.ToUpper());
    }

    private bool IsAdmin()
    {
        var isAdminClaim = User.FindFirst("isAdmin")?.Value;
        return bool.Parse(isAdminClaim ?? "false");
    }
}
