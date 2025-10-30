using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("cas")]
public class Ca
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("codigo_ca")]
    [StringLength(10)]
    public string CodigoCa { get; set; } = string.Empty;

    [Required]
    [Column("nome_ca")]
    [StringLength(200)]
    public string NomeCa { get; set; } = string.Empty;


    [Column("cidade")]
    [StringLength(100)]
    public string? Cidade { get; set; }

    [Column("uf")]
    [StringLength(2)]
    public string? Uf { get; set; }

    [Column("telefone")]
    [StringLength(20)]
    public string? Telefone { get; set; }

    [Column("email")]
    [StringLength(150)]
    public string? Email { get; set; }

    [Column("responsavel")]
    [StringLength(100)]
    public string? Responsavel { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
	public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
    public virtual ICollection<Sugestao> Sugestoes { get; set; } = new List<Sugestao>();
}
