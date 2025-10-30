using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace ControleAtendimento.Helpers;

public class Estado
{
    public required string Sigla { get; set; }
    public required string Nome { get; set; }
    public List<string> Cidades { get; set; } = new();
}

public class EstadoRoot
{
	public List<Estado> Estados { get; set; } = new();
}

public static class BrasilLocationHelper
{
	private static readonly Lazy<EstadoRoot> _data = new(() => {
	    var jsonContent = File.ReadAllText("estados-cidades.json");
	    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
	    return JsonSerializer.Deserialize<EstadoRoot>(jsonContent, options)!;
	});
    
    public static List<string> GetSiglas()
    {
        return _data.Value.Estados.Select(e => e.Sigla).OrderBy(s => s).ToList();
    }
    
    public static List<string> GetNomes()
    {
        return _data.Value.Estados.Select(e => e.Nome).OrderBy(n => n).ToList();
    }
    
    public static List<string> GetCidadesBySigla(string sigla)
    {
        var estado = _data.Value.Estados.FirstOrDefault(e => e.Sigla == sigla);
        return estado?.Cidades.OrderBy(c => c).ToList() ?? new List<string>();
    }
}
