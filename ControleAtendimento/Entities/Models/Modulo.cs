using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("modulos")]
public class Modulo
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("nome_modulo")]
    [StringLength(100)]
    public string NomeModulo { get; set; } = string.Empty;

    [Column("descricao")]
    [StringLength(500)]
    public string? Descricao { get; set; }

    // Navigation properties
    public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
	public virtual ICollection<Assunto> Assuntos { get; set; } = new List<Assunto>();
}
