using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class ModuloDto
{
    [Required]
    [StringLength(100)]
    public string NomeModulo { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descricao { get; set; }
}

public class ModuloResponseDto : ModuloDto
{
    public int Id { get; set; }
    public int TotalAssuntos { get; set; }
}
