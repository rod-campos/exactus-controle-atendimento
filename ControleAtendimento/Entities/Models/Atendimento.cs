using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleAtendimento.Models;

[Table("atendimento")]
public class Atendimento
{
	[Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("numero_ticket")]
    [StringLength(20)]
    public string NumeroTicket { get; set; } = string.Empty;

    [Required]
    [Column("ca_id")]
    public int CaId { get; set; }

    [Required]
    [Column("cliente_id")]
    public int ClienteId { get; set; }

    [Required]
    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Required]
    [Column("assunto_id")]
    public int AssuntoId { get; set; }

    [Required]
    [Column("tipo_atendimento_id")]
    public int TipoAtendimentoId { get; set; }

	[Required]
	[Column("modulo_id")]
    public int ModuloId { get; set; }

    [Required]
    [Column("status_id")]
    public int StatusId { get; set; }

    [Required]
    [Column("titulo")]
    [StringLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    [Column("descricao")]
    public string Descricao { get; set; } = string.Empty;

    [Column("solucao")]
    public string? Solucao { get; set; }

    [Column("data_inicio")]
    public DateTime DataInicio { get; set; } = DateTime.UtcNow;

    [Column("data_fim")]
    public DateTime? DataFim { get; set; }

    [Column("observacoes")]
    public string? Observacoes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual Ca Ca { get; set; } = null!;
    public virtual Cliente Cliente { get; set; } = null!;
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Assunto Assunto { get; set; } = null!;
	public virtual Modulo Modulo { get; set; } = null!;
    public virtual TipoAtendimento TipoAtendimento { get; set; } = null!;
    public virtual StatusAtendimento Status { get; set; } = null!;
}
