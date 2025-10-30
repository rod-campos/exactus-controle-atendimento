using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleAtendimento.Models;

[Table("sugestoes")]
public class Sugestao
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("titulo")]
    [StringLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [Required]
    [Column("conteudo")]
    public string Conteudo { get; set; } = string.Empty;

    [Column("is_read")]
    public bool IsRead { get; set; } = false;

    [Required]
    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("cliente_id")]
    public int? ClienteId { get; set; }

    [Column("ca_id")]
    public int? CaId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Usuario Usuario { get; set; } = null!;
    public virtual Cliente? Cliente { get; set; }
    public virtual Ca? Ca { get; set; }
}
