using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

using ControleAtendimento.Models;

namespace ControleAtendimento.Dtos;

public class AtendimentoCreateDto
{
    [Required]
    public int CaId { get; set; }

    [Required]
    public int ClienteId { get; set; }

    [Required]
    public int ModuloId { get; set; } 

    [Required]
    public int AssuntoId { get; set; }

    [Required]
    public int TipoAtendimentoId { get; set; }

    [Required]
    [StringLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Descricao { get; set; } = string.Empty;

    // 1 == Baixa
    // 2 == Normal
    // 3 == Importante
    // 4 == Urgente
    [Range(1, 4)]
    public int Prioridade { get; set; } = 2;

    // Admin can assign to other users
    public int? UsuarioId { get; set; }
}

public class AtendimentoUpdateDto
{
    [StringLength(200)]
    public string? Titulo { get; set; }

    [StringLength(2000)]
    public string? Descricao { get; set; }

    [StringLength(2000)]
    public string? Solucao { get; set; }

    [Range(1, 4)]
    public int? Prioridade { get; set; }

    [StringLength(1000)]
    public string? Observacoes { get; set; }

    public int? UsuarioId { get; set; }
    public int? StatusId { get; set; }
    public int? ModuloId { get; set; }
    public DateTime? DataFim { get; set; }
    public DateTime? DataInicio { get; set; }
}

public class AtendimentoResponseDto
{
    public int Id { get; set; }
    public string NumeroTicket { get; set; } = string.Empty;
    public string Titulo { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public string? Solucao { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public string? Observacoes { get; set; }

    public CaBasicDto Ca { get; set; } = new();
    public ClienteBasicDto Cliente { get; set; } = new();
    public UsuarioBasicDto Usuario { get; set; } = new();
    public AssuntoBasicDto Assunto { get; set; } = new();
    public ModuloBasicDto Modulo { get; set; } = new();
    public TipoAtendimentoBasicDto TipoAtendimento { get; set; } = new();
    public StatusAtendimentoBasicDto Status { get; set; } = new();
}

public class CaBasicDto
{
    public int Id { get; set; }
    public string CodigoCa { get; set; } = string.Empty;
    public string NomeCa { get; set; } = string.Empty;
    public string? Cidade { get; set; }
    public string? Uf { get; set; }
}

public class ClienteBasicDto
{
    public int Id { get; set; }
    public string CodigoCliente { get; set; } = string.Empty;
    public string NomeCliente { get; set; } = string.Empty;
    public string StatusCliente { get; set; } = string.Empty;
    public string? Telefone { get; set; }
    public string? Email { get; set; }
}

public class UsuarioBasicDto
{
    public int Id { get; set; }
    public string NomeUsuario { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Cargo { get; set; }
}

public class AssuntoBasicDto
{
    public int Id { get; set; }
    public string TipoAssunto { get; set; } = string.Empty;
    public string? Descricao { get; set; }
}

public class TipoAtendimentoBasicDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int Prioridade { get; set; }
}

public class StatusAtendimentoBasicDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public bool IsFinal { get; set; }
}

public class ModuloBasicDto
{
    public int Id { get; set; }
    public string NomeModulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
}
