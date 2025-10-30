using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class TipoAtendimentoDto
{
    [Required]
    [StringLength(100)]
    public string Nome { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descricao { get; set; }

    public int Prioridade { get; set; } = 1;
}

public class TipoAtendimentoResponseDto : TipoAtendimentoDto
{
    public int Id { get; set; }
}
