using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace ControleAtendimento.Models;

[Table("status_atendimentos")]
public class StatusAtendimento
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("nome")]
    [StringLength(50)]
    public string Nome { get; set; } = string.Empty;

    [Column("descricao")]
    [StringLength(200)]
    public string? Descricao { get; set; }

    [Column("ordem")]
    public int Ordem { get; set; } = 0;

    [Column("is_final")]
    public bool IsFinal { get; set; } = false;

    // Navigation properties
	public virtual ICollection<Atendimento> Atendimentos { get; set; } = new List<Atendimento>();
}
