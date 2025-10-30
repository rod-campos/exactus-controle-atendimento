using System.ComponentModel.DataAnnotations;

namespace ControleAtendimento.Dtos;

public class RefreshTokenRequestDto
{
    /// <summary>
    /// The refresh token to use for generating new JWT token
    /// </summary>
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class RefreshTokenResponseDto
{
    /// <summary>
    /// New JWT access token
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// New refresh token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
