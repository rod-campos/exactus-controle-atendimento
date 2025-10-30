using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControleAtendimento.Models;

[Table("refresh_tokens")]
public class RefreshToken
{
	[Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [Column("token")]
    [StringLength(256)]
    public string Token { get; set; } = string.Empty;

    [Required]
    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Required]
    [Column("expira_em")]
    public DateTime ExpiraEm { get; set; }

    [Column("criado_em")]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    [Column("criado_por_ip")]
    [StringLength(45)]
    public string? CriadoPorIp { get; set; }

    [Column("revogado_em")]
    public DateTime? RevogadoEm { get; set; }

    // Navigation properties
    public virtual Usuario Usuario { get; set; } = null!;
}
