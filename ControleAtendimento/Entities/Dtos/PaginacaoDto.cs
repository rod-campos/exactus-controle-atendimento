using System.Collections.Generic;

namespace ControleAtendimento.Dtos;

// TODO: Make proper paginated object instead of calculating
// in every class
public class PaginacaoResponseDto<T>
{
    public List<T> Dados { get; set; } = new();
    public int TotalRegistros { get; set; }
    public int Pagina { get; set; }
    public int TamanhoPagina { get; set; }
    public int TotalPaginas { get; set; }
    public bool TemProximaPagina { get; set; }
    public bool TemPaginaAnterior { get; set; }
}
