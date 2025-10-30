using System;
using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class SugestaoCreateDto
{
    [Required]
    [StringLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    [StringLength(2000)]
    public string Conteudo { get; set; } = string.Empty;

    public int? ClienteId { get; set; }
    public int? CaId { get; set; }
}

public class SugestaoUpdateDto
{
    [StringLength(200)]
    public string? Titulo { get; set; }

    [StringLength(2000)]
    public string? Conteudo { get; set; }

    public int? ClienteId { get; set; }
    public int? CaId { get; set; }
}

public class SugestaoResponseDto
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Conteudo { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public int UsuarioId { get; set; }
    public string NomeUsuario { get; set; } = string.Empty;
    public string EmailUsuario { get; set; } = string.Empty;
    public int? ClienteId { get; set; }
    public string? NomeCliente { get; set; }
    public string? CodigoCliente { get; set; }
    public int? CaId { get; set; }
    public string? NomeCa { get; set; }
    public string? CodigoCa { get; set; }
}
