using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleAtendimento.Models;

[Table("configuracoes")]
public class Configuracao
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("chave")]
    [StringLength(100)]
    public string Chave { get; set; } = string.Empty;

    [Required]
    [Column("valor")]
    public string Valor { get; set; } = string.Empty;

    [Column("descricao")]
    [StringLength(500)]
    public string? Descricao { get; set; }

    [Column("tipo")]
    [StringLength(50)]
    public string Tipo { get; set; } = "STRING";

    [Column("editavel")]
	public bool Editavel { get; set; } = true;
}
