using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic; 

using Microsoft.EntityFrameworkCore;
using NSwag;
using NSwag.Generation.Processors.Security;

using ControleAtendimento.Models;

namespace ControleAtendimento.Data;

public class AtendimentoDbContext : DbContext
{
    public AtendimentoDbContext(DbContextOptions<AtendimentoDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Modulo> Modulos { get; set; }
    public DbSet<Assunto> Assuntos { get; set; }
    public DbSet<Ca> Cas { get; set; }
    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<TipoAtendimento> TiposAtendimento { get; set; }
    public DbSet<StatusAtendimento> StatusAtendimentos { get; set; }
    public DbSet<Atendimento> Atendimentos { get; set; }
    public DbSet<Configuracao> Configuracoes { get; set; }
    public DbSet<Sugestao> Sugestoes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        ConfigureDateTimeProperties(modelBuilder);
        ConfigureRelationships(modelBuilder);
        ConfigureIndexes(modelBuilder);
        ConfigureValueConversions(modelBuilder);
        SeedData(modelBuilder);
    }

    private void ConfigureDateTimeProperties(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
              
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
              
            entity.Property(e => e.UltimoLogin).HasColumnType("timestamp");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.Property(e => e.CriadoEm)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
              
            entity.Property(e => e.ExpiraEm).HasColumnType("timestamp");
            entity.Property(e => e.RevogadoEm).HasColumnType("timestamp");
        });

        modelBuilder.Entity<Ca>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
              
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Cliente>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
              
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Atendimento>(entity =>
        {
            entity.Property(e => e.DataInicio)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
              
            entity.Property(e => e.DataFim).HasColumnType("timestamp");
              
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
              
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        });

        modelBuilder.Entity<Sugestao>(entity =>
        {
            entity.Property(e => e.CreatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
                  
            entity.Property(e => e.UpdatedAt)
                .HasColumnType("timestamp")
                .HasDefaultValueSql("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
        });
    }

    private void ConfigureRelationships(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RefreshToken>()
            .HasOne(rt => rt.Usuario)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Assunto>()
            .HasOne(a => a.Modulo)
            .WithMany(m => m.Assuntos)
            .HasForeignKey(a => a.ModuloId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Cliente>()
            .HasOne(c => c.Ca)
            .WithMany(ca => ca.Clientes)
            .HasForeignKey(c => c.CaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.Ca)
            .WithMany(ca => ca.Atendimentos)
            .HasForeignKey(a => a.CaId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Atendimento>()
            .HasOne(u => u.Modulo)
            .WithMany(ca => ca.Atendimentos)
            .HasForeignKey(u => u.ModuloId)
            .OnDelete(DeleteBehavior.Restrict);

         modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.Cliente)
            .WithMany(c => c.Atendimentos)
            .HasForeignKey(a => a.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.Usuario)
            .WithMany(u => u.Atendimentos)
            .HasForeignKey(a => a.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.Assunto)
            .WithMany(at => at.Atendimentos)
            .HasForeignKey(a => a.AssuntoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.TipoAtendimento)
            .WithMany(at => at.Atendimentos)
            .HasForeignKey(a => a.TipoAtendimentoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Atendimento>()
            .HasOne(a => a.Status)
            .WithMany(s => s.Atendimentos)
            .HasForeignKey(a => a.StatusId)
            .OnDelete(DeleteBehavior.Restrict);
        
        modelBuilder.Entity<Sugestao>()
            .HasOne(s => s.Usuario)
            .WithMany(u => u.Sugestoes)
            .HasForeignKey(s => s.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    
        modelBuilder.Entity<Sugestao>()
            .HasOne(s => s.Cliente)
            .WithMany(c => c.Sugestoes)
            .HasForeignKey(s => s.ClienteId)
            .OnDelete(DeleteBehavior.SetNull);
    
        modelBuilder.Entity<Sugestao>()
            .HasOne(s => s.Ca)
            .WithMany(ca => ca.Sugestoes)
            .HasForeignKey(s => s.CaId)
            .OnDelete(DeleteBehavior.SetNull);
    }

    private void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .HasDatabaseName("ix_usuario_email")
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.IsActive)
            .HasDatabaseName("ix_usuario_ativo");

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.Token)
            .HasDatabaseName("ix_refresh_token")
            .IsUnique();

        modelBuilder.Entity<RefreshToken>()
            .HasIndex(rt => rt.UsuarioId)
            .HasDatabaseName("ix_refresh_token_user");
    
        modelBuilder.Entity<Modulo>()
            .HasIndex(m => m.NomeModulo)
            .HasDatabaseName("ix_modulo_nome")
            .IsUnique();

        modelBuilder.Entity<Assunto>()
            .HasIndex(a => a.ModuloId)
            .HasDatabaseName("ix_assunto_modulo");

        modelBuilder.Entity<Ca>()
            .HasIndex(ca => ca.CodigoCa)
            .HasDatabaseName("ix_ca_codigo")
            .IsUnique();

        modelBuilder.Entity<Ca>()
            .HasIndex(ca => ca.NomeCa)
            .HasDatabaseName("ix_ca_nome");

        modelBuilder.Entity<Ca>()
            .HasIndex(ca => ca.IsActive)
            .HasDatabaseName("ix_ca_ativo");

        modelBuilder.Entity<Cliente>()
              .HasIndex(c => new { c.CaId, c.CodigoCliente })
              .HasDatabaseName("ix_cliente_ca_codigo")
              .IsUnique();

        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.NomeCliente)
            .HasDatabaseName("ix_cliente_nome");
        modelBuilder.Entity<Cliente>()
            .HasIndex(c => c.IsActive)
            .HasDatabaseName("ix_cliente_ativo");

        modelBuilder.Entity<StatusAtendimento>()
            .HasIndex(sa => sa.Ordem)
            .HasDatabaseName("ix_status_ordem");

        modelBuilder.Entity<Atendimento>()
            .HasIndex(a => a.NumeroTicket)
            .HasDatabaseName("ix_atendimento_numero")
            .IsUnique();

        modelBuilder.Entity<Atendimento>()
            .HasIndex(a => a.UsuarioId)
            .HasDatabaseName("ix_atendimento_usuario");

        modelBuilder.Entity<Atendimento>()
            .HasIndex(a => a.CaId)
            .HasDatabaseName("ix_atendimento_ca");

        modelBuilder.Entity<Atendimento>()
            .HasIndex(a => a.ClienteId)
            .HasDatabaseName("ix_atendimento_cliente");

        modelBuilder.Entity<Atendimento>()
            .HasIndex(a => a.StatusId)
            .HasDatabaseName("ix_atendimento_status");

        modelBuilder.Entity<Atendimento>()
            .HasIndex(a => a.DataInicio)
            .HasDatabaseName("ix_atendimento_data_inicio");

        modelBuilder.Entity<Configuracao>()
            .HasIndex(c => c.Chave)
            .HasDatabaseName("ix_configuracao_chave")
            .IsUnique();

        modelBuilder.Entity<Sugestao>()
            .HasIndex(s => s.UsuarioId)
            .HasDatabaseName("ix_sugestao_usuario");

        modelBuilder.Entity<Sugestao>()
            .HasIndex(s => s.ClienteId)
            .HasDatabaseName("ix_sugestao_cliente");
        
        modelBuilder.Entity<Sugestao>()
            .HasIndex(s => s.CaId)
            .HasDatabaseName("ix_sugestao_ca");
        
        modelBuilder.Entity<Sugestao>()
            .HasIndex(s => s.IsRead)
            .HasDatabaseName("ix_sugestao_lida");
        
        modelBuilder.Entity<Sugestao>()
            .HasIndex(s => s.CreatedAt)
            .HasDatabaseName("ix_sugestao_created_at");
    }

    private void ConfigureValueConversions(ModelBuilder modelBuilder)
    {
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
                        v => v.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(v, DateTimeKind.Utc) : v.ToUniversalTime(),
                        v => DateTime.SpecifyKind(v, DateTimeKind.Utc)));
                }
            }
        }
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<StatusAtendimento>().HasData(
            new StatusAtendimento { Id = 1, Nome = "Aberto", Descricao = "Atendimento criado", Ordem = 1, IsFinal = false },
            new StatusAtendimento { Id = 2, Nome = "Em Andamento", Descricao = "Atendimento sendo executado", Ordem = 2, IsFinal = false },
            new StatusAtendimento { Id = 3, Nome = "Aguardando Cliente", Descricao = "Aguardando resposta do cliente",  Ordem = 3, IsFinal = false },
            new StatusAtendimento { Id = 4, Nome = "Resolvido", Descricao = "Atendimento resolvido", Ordem = 4, IsFinal = true },
            new StatusAtendimento { Id = 5, Nome = "Cancelado", Descricao = "Atendimento cancelado", Ordem = 5, IsFinal = true }
        );

        modelBuilder.Entity<Modulo>().HasData(
            new Modulo { Id = 1, NomeModulo = "Suporte Técnico", Descricao = "Módulo de suporte técnico"},
            new Modulo { Id = 2, NomeModulo = "Comercial", Descricao = "Módulo comercial"},
            new Modulo { Id = 3, NomeModulo = "Financeiro", Descricao = "Módulo financeiro"},
            new Modulo { Id = 4, NomeModulo = "Administração", Descricao = "Módulo administrativo"}
        );

        modelBuilder.Entity<TipoAtendimento>().HasData(
            new TipoAtendimento { Id = 1, Nome = "Suporte", Descricao = "Suporte técnico geral", Prioridade = 2 },
            new TipoAtendimento { Id = 2, Nome = "Instalação", Descricao = "Instalação de sistemas", Prioridade = 2 },
            new TipoAtendimento { Id = 3, Nome = "Manutenção", Descricao = "Manutenção preventiva/corretiva", Prioridade = 1 },
            new TipoAtendimento { Id = 4, Nome = "Emergência", Descricao = "Atendimento de emergência", Prioridade = 4 }
          );

        modelBuilder.Entity<Assunto>().HasData(
            new Assunto { Id = 1, TipoAssunto = "Problemas de Sistema", ModuloId = 1, Descricao = "Problemas gerais no sistema" },
            new Assunto { Id = 2, TipoAssunto = "Instalação de Software", ModuloId = 1, Descricao = "Instalação e configuração de software" },
            new Assunto { Id = 3, TipoAssunto = "Manutenção Preventiva", ModuloId = 1, Descricao = "Manutenção preventiva de sistemas" },
            new Assunto { Id = 4, TipoAssunto = "Negociação de Contrato", ModuloId = 2, Descricao = "Negociação e renovação de contratos" },
            new Assunto { Id = 5, TipoAssunto = "Proposta Comercial", ModuloId = 2, Descricao = "Elaboração de propostas comerciais" },
            new Assunto { Id = 6, TipoAssunto = "Cobrança", ModuloId = 3, Descricao = "Questões relacionadas a cobrança" },
            new Assunto { Id = 7, TipoAssunto = "Faturamento", ModuloId = 3, Descricao = "Problemas de faturamento" }
        );

        modelBuilder.Entity<Configuracao>().HasData(
            new Configuracao { Id = 1, Chave = "SISTEMA_NOME", Valor = "Sistema de Controle de Atendimento", Descricao = "Nome do sistema", Tipo = "STRING" },
            new Configuracao { Id = 2, Chave = "SISTEMA_VERSAO", Valor = "1.0.0", Descricao = "Versão do sistema", Tipo = "STRING" },
            new Configuracao { Id = 3, Chave = "TICKET_PREFIXO", Valor = "ATD", Descricao = "Prefixo para números de ticket", Tipo = "STRING" },
            new Configuracao { Id = 4, Chave = "SESSAO_TIMEOUT_MINUTOS", Valor = "480", Descricao = "Timeout de sessão em minutos", Tipo = "NUMBER" },
            new Configuracao { Id = 5, Chave = "MAX_TENTATIVAS_LOGIN", Valor = "5", Descricao = "Máximo de tentativas de login", Tipo = "NUMBER" }
        );

        modelBuilder.Entity<Usuario>().HasData(
            new Usuario 
                { 
                    Id = 1,
                    NomeUsuario = "Administrador", 
                    Email = "admin@exactus.com", 
                    SenhaHash = "$2a$12$CcUr8BPRx6gIYPGaVfXyeOupZR0/c8QEPkbGSbLJL4jMGlGmjRxIK", 
                    IsActive = true,
                    IsAdmin = true, 
                }
        );

        modelBuilder.Entity<Ca>().HasData(
            new Ca { Id = 1, CodigoCa = "0001", NomeCa = "CA Exemplo 001", Cidade = "São Paulo", Uf = "SP" },
            new Ca { Id = 2, CodigoCa = "0025", NomeCa = "CA Norte", Cidade = "Manaus", Uf = "AM" }
        );

        modelBuilder.Entity<Cliente>().HasData(
            new Cliente { Id = 1, CodigoCliente = "000001", CaId = 1, NomeCliente = "Cliente Teste 1", Cidade = "São Paulo", Uf = "SP" },
            new Cliente { Id = 2, CodigoCliente = "000025", CaId = 1, NomeCliente = "Cliente VIP", Cidade = "Rio de Janeiro", Uf = "RJ" }
        );
    }

    public override int SaveChanges()
    {
        UpdateTimestamps();
        return base.SaveChanges();
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Entity is Usuario usuario)
            {
                if (entry.State == EntityState.Added)
                {
                    usuario.CreatedAt = DateTime.UtcNow;
                }
                usuario.UpdatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is Ca ca)
            {
                if (entry.State == EntityState.Added)
                {
                    ca.CreatedAt = DateTime.UtcNow;
                }
                ca.UpdatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is Cliente cliente)
            {
                if (entry.State == EntityState.Added)
                {
                    cliente.CreatedAt = DateTime.UtcNow;
                }
                cliente.UpdatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is Atendimento atendimento)
            {
                if (entry.State == EntityState.Added)
                {
                    atendimento.CreatedAt = DateTime.UtcNow;
                    atendimento.DataInicio = DateTime.UtcNow;
                }
                atendimento.UpdatedAt = DateTime.UtcNow;
            }
            else if (entry.Entity is Sugestao sugestao)
            {
                if (entry.State == EntityState.Added)
                {
                    sugestao.CreatedAt = DateTime.UtcNow;
                }
                sugestao.UpdatedAt = DateTime.UtcNow;
            }
        }
    }
}
