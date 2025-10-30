using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("usuarios")]
public class Usuario
{
	[Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("nome_usuario")]
    [StringLength(100)]
    public string NomeUsuario { get; set; } = string.Empty;

    [Required]
    [Column("email")]
    [StringLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [Column("senha_hash")]
    [StringLength(256)]
    public string SenhaHash { get; set; } = string.Empty;

    [Column("is_admin")]
    public bool IsAdmin { get; set; } = false;

    [Column("telefone")]
    [StringLength(20)]
    public string? Telefone { get; set; }

    [Column("cargo")]
    [StringLength(100)]
    public string? Cargo { get; set; }

    [Column("ultimo_login")]
    public DateTime? UltimoLogin { get; set; }

    [Column("tentativas_login")]
    public int TentativasLogin { get; set; } = 0;

    [Column("is_active")]
	public bool IsActive { get; set; } = true;

	[Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
	public virtual ICollection<Sugestao> Sugestoes { get; set; } = new List<Sugestao>();
}
