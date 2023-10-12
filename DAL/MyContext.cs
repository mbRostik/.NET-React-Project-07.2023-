using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DAL.Models;
using System.Data;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace DAL
{
    public class MyContext : IdentityDbContext<User>
    {
        public MyContext(DbContextOptions<MyContext> options) : base(options){ }

        public DbSet<RefreshToken> refreshTokens { get; set; }
        public DbSet<Coin> coins { get; set; }
        public DbSet<User> users { get; set; }
        public DbSet<Wallet> wallets { get; set; }
        public DbSet<News> news { get; set; }
        public DbSet<Post> posts { get; set; }
        public DbSet<Like> likes { get; set; }
        public DbSet<Follow> follows { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshToken>(entity =>
            {
                entity.HasKey(e => e.TokenId);

                entity.ToTable("RefreshToken");

                entity.Property(e => e.TokenId).HasColumnName("token_id");

                entity.Property(e => e.ExpiryDate)
                    .HasColumnName("expiry_date")
                    .HasColumnType("datetime");

                entity.Property(e => e.Token)
                    .IsRequired()
                    .HasColumnName("token")
                    .HasMaxLength(200)
                    .IsUnicode(false);

                entity.Property(e => e.UserId).HasColumnName("UserId");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.RefreshTokens)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__RefreshTo__user___60FC61CA");
            });

            modelBuilder.Entity<Coin>(entity =>
            {
                entity.ToTable("Coins")
                .HasKey(w => w.Id);

                entity.Property(w => w.Id)
               .IsRequired()
               .ValueGeneratedOnAdd()
               .HasAnnotation("DatabaseGenerated", DatabaseGeneratedOption.Identity);

                entity.HasData(
                    new Coin { Id = 1, Name = "DYDX", Price = 0.7F },
                    new Coin { Id = 2, Name = "BTC", Price = 30000 },
                    new Coin { Id = 3, Name = "BNB", Price = 1000 }
                );
            });

            modelBuilder.Entity<Wallet>(entity =>
            {
                entity.ToTable("Wallets").HasKey(w => new { w.UserId, w.CoinId });
            });

            modelBuilder.Entity<Like>(entity =>
            {
                entity.ToTable("Likes").HasKey(l => new { l.UserId, l.PostId });

                entity.Property(w => w.Id)
                   .IsRequired()
                   .ValueGeneratedOnAdd()
                   .HasAnnotation("DatabaseGenerated", DatabaseGeneratedOption.Identity);

                entity.HasOne(u => u.Post)
                      .WithMany(l => l.Likes)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Follow>(entity =>
            {
                entity.ToTable("Follows").HasKey(l => new { l.UserId, l.FollowerId });

                entity.Property(w => w.Id)
                   .IsRequired()
                   .ValueGeneratedOnAdd()
                   .HasAnnotation("DatabaseGenerated", DatabaseGeneratedOption.Identity);

                entity.HasOne(u => u.Follower)
                      .WithMany(l => l.Follows)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<News>(entity =>
            {
                entity.ToTable("News")
                .HasKey(w => w.Id);

                entity.Property(w => w.Id)
               .IsRequired()
               .ValueGeneratedOnAdd()
               .HasAnnotation("DatabaseGenerated", DatabaseGeneratedOption.Identity);
            });

            modelBuilder.Entity<Post>(entity =>
            {
                entity.ToTable("Posts")
                .HasKey(w => w.Id);

                entity.Property(w => w.Id)
               .IsRequired()
               .ValueGeneratedOnAdd()
               .HasAnnotation("DatabaseGenerated", DatabaseGeneratedOption.Identity);

                entity.Property(e => e.Date)
                    .HasColumnName("Date")
                    .HasColumnType("datetime");
                entity.Property(e => e.UserId).HasColumnName("UserId");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.Posts)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__PostsTo__user");
            });

            modelBuilder.Entity<IdentityRole>(entity =>
            {
                entity.HasData(
                    new IdentityRole { Id = "1", Name = "USER", NormalizedName = "USER" },
                    new IdentityRole { Id = "2", Name = "ADMIN", NormalizedName = "ADMIN" }
                );
            });
        }
    }
}
