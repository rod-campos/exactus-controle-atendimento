using System;
using System.Collections.Generic;
using ControleAtendimento.Models;
using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class CaDto
{
    [Required]
    [StringLength(10)]
    public string CodigoCa { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string NomeCa { get; set; } = string.Empty;

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
}

public class CaResponseDto : CaDto
{
    public int Id { get; set; }
    public bool IsActive { get; set; }
    public int TotalClientes { get; set; }
    public int TotalAtendimentos { get; set; }
}
