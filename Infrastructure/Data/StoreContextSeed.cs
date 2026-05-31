using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Domain.Entities;

namespace Infrastructure.Data
{
    public class StoreContextSeed
    {
        public static async Task SeedAsync(StoreContext context)
        {
            if (!context.Products.Any())
            {
                var productsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/products.json");

                var products = JsonSerializer.Deserialize<List<Product>>(productsData);

                if (products == null) return;

                context.Products.AddRange(products);
                await context.SaveChangesAsync();
            }

            if (!context.DeliveryMethods.Any())
            {
                var deliveryMethodsData = await File.ReadAllTextAsync("../Infrastructure/Data/SeedData/deliveryMethods.json");

                var deliveryMethods = JsonSerializer.Deserialize<List<DeliveryMethod>>(deliveryMethodsData);

                if (deliveryMethods == null) return;

                context.DeliveryMethods.AddRange(deliveryMethods);
                await context.SaveChangesAsync();
            }
        }
    }
}