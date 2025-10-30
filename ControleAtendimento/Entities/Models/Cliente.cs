using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("clientes")]
public class Cliente
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("codigo_cliente")]
    [StringLength(15)]
    public string CodigoCliente { get; set; } = string.Empty;

    [Required]
    [Column("ca_id")]
    public int CaId { get; set; }

    [Required]
    [Column("nome_cliente")]
    [StringLength(200)]
    public string NomeCliente { get; set; } = string.Empty;

    [Column("razao_social")]
    [StringLength(300)]
    public string? RazaoSocial { get; set; }

    [Column("cnpj_cpf")]
    [StringLength(18)]
    public string? CnpjCpf { get; set; }

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

    // ATIVO, INATIVO, SUSPENSO
    [Column("status_cliente")]
    [StringLength(20)]
    public string StatusCliente { get; set; } = "ATIVO";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual Ca Ca { get; set; } = null!;
	public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
    public virtual ICollection<Sugestao> Sugestoes { get; set; } = new List<Sugestao>();
}
