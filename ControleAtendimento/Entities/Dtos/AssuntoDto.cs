using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class AssuntoDto
{
    [Required]
    [StringLength(100)]
    public string TipoAssunto { get; set; } = string.Empty;

    [Required]
    public int ModuloId { get; set; }

    [StringLength(500)]
    public string? Descricao { get; set; }
}

public class AssuntoResponseDto : AssuntoDto
{
    public int Id { get; set; }
    public string? NomeModulo { get; set; }
}
