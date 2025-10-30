using System;
using System.Collections.Generic;
using ControleAtendimento.Models;
using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class ClienteDto
{
    [Required]
    [StringLength(15)]
    public string CodigoCliente { get; set; } = string.Empty;

    [Required]
    public int CaId { get; set; }

    [Required]
    [StringLength(200)]
    public string NomeCliente { get; set; } = string.Empty;

    [StringLength(300)]
    public string? RazaoSocial { get; set; }

    [StringLength(18)]
    public string? CnpjCpf { get; set; }

    [StringLength(100)]
    public string? Cidade { get; set; }

    [StringLength(2)]
    public string? Uf { get; set; }

    [StringLength(20)]
    public string? Telefone { get; set; }

    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(100)]
    public string? Responsavel { get; set; }

    [StringLength(20)]
    public string StatusCliente { get; set; } = "ATIVO";
}

public class ClienteResponseDto : ClienteDto
{
    public int Id { get; set; }
    public bool IsActive { get; set; }
    public string NomeCa { get; set; } = string.Empty;
    public string CodigoCa { get; set; } = string.Empty;
    public int TotalAtendimentos { get; set; }
}
