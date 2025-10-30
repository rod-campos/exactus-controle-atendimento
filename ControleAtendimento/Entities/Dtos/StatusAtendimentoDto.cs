using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class StatusAtendimentoDto
{
    [Required]
    [StringLength(50)]
    public string Nome { get; set; } = string.Empty;

    [StringLength(200)]
    public string? Descricao { get; set; }

    public int Ordem { get; set; } = 0;
    public bool IsFinal { get; set; } = false;
}

public class StatusAtendimentoResponseDto : StatusAtendimentoDto
{
    public int Id { get; set; }
}
