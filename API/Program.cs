using API.Middleware;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;    
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using StackExchange.Redis;
using Infrastructure.Services;
using API.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add configuration from environment variables
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<StoreContext>(opt =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
    
    opt.UseSqlServer(
    connectionString,
    sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });
});

builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddCors();
builder.Services.AddSingleton<IConnectionMultiplexer>(config =>
{
    var redisConnectionString = builder.Configuration.GetConnectionString("Redis")
        ?? throw new Exception("Redis connection string is not configured.");
    var configuration = ConfigurationOptions.Parse(redisConnectionString, true);
    return ConnectionMultiplexer.Connect(configuration);
});
builder.Services.AddSingleton<ICartService, CartService>();
builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<AppUser>()
    .AddEntityFrameworkStores<StoreContext>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddSignalR();

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials()
    .WithOrigins("http://localhost:4200", "https://localhost:4200"));

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapGroup("api").MapIdentityApi<AppUser>();
app.MapHub<NotificationHub>("/hubs/notifications");
app.MapFallbackToController("Index", "Fallback");

await ApplyMigrationsAndSeedWithRetryAsync(app);

app.Run();

static async Task ApplyMigrationsAndSeedWithRetryAsync(WebApplication app)
{
    const int maxAttempts = 10;
    var delay = TimeSpan.FromSeconds(3);

    for (var attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            using var scope = app.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<StoreContext>();
            await context.Database.MigrateAsync();
            await StoreContextSeed.SeedAsync(context);

            app.Logger.LogInformation("Database migration and seed completed successfully.");
            return;
        }
        catch (SqlException ex)
        {
            var isLastAttempt = attempt == maxAttempts;
            app.Logger.LogWarning(ex, "Database is not ready yet (attempt {Attempt}/{MaxAttempts}).", attempt, maxAttempts);

            if (isLastAttempt)
            {
                if (app.Environment.IsDevelopment())
                {
                    app.Logger.LogError(ex, "Skipping migration/seed in Development after {MaxAttempts} attempts.", maxAttempts);
                    return;
                }

                throw;
            }

            await Task.Delay(delay);
        }
    }
}
