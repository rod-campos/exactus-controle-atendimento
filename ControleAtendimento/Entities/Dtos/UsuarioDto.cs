using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

using ControleAtendimento.Models;

namespace ControleAtendimento.Dtos;

public class UsuarioDto
{
    [Required]
    [StringLength(100)]
    public string NomeUsuario { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [StringLength(20)]
    public string? Telefone { get; set; }

    [StringLength(100)]
    public string? Cargo { get; set; }

    public bool IsAdmin { get; set; } = false;
}

public class UsuarioCreateDto : UsuarioDto
{
    [Required]
    [MinLength(8)]
    [StringLength(100)]
    public string Senha { get; set; } = string.Empty;
}

public class UsuarioUpdateDto
{
    [StringLength(100)]
    public string? NomeUsuario { get; set; }

    [EmailAddress]
    [StringLength(150)]
    public string? Email { get; set; }

    [StringLength(20)]
    public string? Telefone { get; set; }

    [StringLength(100)]
    public string? Cargo { get; set; }

    public bool? IsAdmin { get; set; }
}

public class UsuarioLoginDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Senha { get; set; } = string.Empty;
}

public class UsuarioResponseDto : UsuarioDto
{
    public int Id { get; set; }
    public DateTime? UltimoLogin { get; set; }
    public bool IsActive { get; set; }
}
