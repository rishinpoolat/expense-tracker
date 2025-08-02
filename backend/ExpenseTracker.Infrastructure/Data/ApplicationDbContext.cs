using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Core.Enums;

namespace ExpenseTracker.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Expense
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");

                // Relationships
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Expenses)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Category)
                      .WithMany(c => c.Expenses)
                      .HasForeignKey(e => e.CategoryId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Category
            modelBuilder.Entity<Category>(entity =>
            {
                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.CategoryType).HasConversion<int>();
            });

            // Seed categories
            SeedCategories(modelBuilder);
        }

        private static void SeedCategories(ModelBuilder modelBuilder)
        {
            var categories = new[]
            {
                new Category { Id = 1, Name = "Food & Dining", Description = "Restaurants, groceries, food delivery", CategoryType = ExpenseCategory.Food, CreatedAt = DateTime.UtcNow },
                new Category { Id = 2, Name = "Transportation", Description = "Gas, public transport, parking", CategoryType = ExpenseCategory.Transportation, CreatedAt = DateTime.UtcNow },
                new Category { Id = 3, Name = "Entertainment", Description = "Movies, games, subscriptions", CategoryType = ExpenseCategory.Entertainment, CreatedAt = DateTime.UtcNow },
                new Category { Id = 4, Name = "Healthcare", Description = "Medical bills, pharmacy", CategoryType = ExpenseCategory.Healthcare, CreatedAt = DateTime.UtcNow },
                new Category { Id = 5, Name = "Shopping", Description = "Clothing, electronics", CategoryType = ExpenseCategory.Shopping, CreatedAt = DateTime.UtcNow },
                new Category { Id = 6, Name = "Utilities", Description = "Electricity, water, internet", CategoryType = ExpenseCategory.Utilities, CreatedAt = DateTime.UtcNow }
            };

            modelBuilder.Entity<Category>().HasData(categories);
        }
    }
}