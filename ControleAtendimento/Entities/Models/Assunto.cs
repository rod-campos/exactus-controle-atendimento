using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("assuntos")]
public class Assunto
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("tipo_assunto")]
    [StringLength(100)]
    public string TipoAssunto { get; set; } = string.Empty;

    [Required]
    [Column("modulo_id")]
    public int ModuloId { get; set; }

    [Column("descricao")]
    [StringLength(500)]
    public string? Descricao { get; set; }

    // Navigation properties
    public virtual Modulo Modulo { get; set; } = null!;
	public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
}
