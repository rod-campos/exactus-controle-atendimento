using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("tipos_atendimento")]
public class TipoAtendimento
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("nome")]
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;

    [Column("descricao")]
    [StringLength(500)]
    public string? Descricao { get; set; }

	// 1 => "Baixa",
	// 2 => "Normal", 
    // 3 => "Alta",
    // 4 => "Urgente",
    [Column("prioridade")]
    public int Prioridade { get; set; } = 1;

    // Navigation properties
	public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
}
