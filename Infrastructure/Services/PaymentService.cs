using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Services
{
    public class PaymentService(IConfiguration config,
        ICartService cartService,
        IUnitOfWork unit) : IPaymentService
    {
        public async Task<ShoppingCart?> CreateOrUpdatePaymentIntent(string cartId)
        {
            Stripe.StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];

            var cart = await cartService.GetCartAsync(cartId);

            if(cart == null) return null;

            var shippingPrice = 0m;

            if (cart.DeliveryMethodId.HasValue)
            {
                var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync((int)cart.DeliveryMethodId);

                if (deliveryMethod == null) return null;

                shippingPrice = deliveryMethod.Price;
            }

            foreach (var item in cart.Items)
            {
                var productItem = await unit.Repository<Product>().GetByIdAsync(item.ProductId);

                if (productItem == null) return null;

                if (item.Price != productItem.Price)
                {
                    item.Price = productItem.Price;
                }
            }

            var service = new Stripe.PaymentIntentService();

            Stripe.PaymentIntent? intent = null;

            if(string.IsNullOrEmpty(cart.PaymentIntentId))
            {
                var options = new Stripe.PaymentIntentCreateOptions
                {
                    Amount = (long)cart.Items.Sum(i => i.Quantity * (i.Price * 100)) + (long)(shippingPrice * 100),
                    Currency = "usd",
                    PaymentMethodTypes = ["card"]
                };

                intent = await service.CreateAsync(options);

                cart.PaymentIntentId = intent.Id;
                cart.ClientSecret = intent.ClientSecret;
            }
            else
            {
                var options = new Stripe.PaymentIntentUpdateOptions
                {
                    Amount = (long)cart.Items.Sum(i => i.Quantity * i.Price * 100) + (long)(shippingPrice * 100)
                };

                intent = await service.UpdateAsync(cart.PaymentIntentId, options);
            }


            await cartService.SetCartAsync(cart);

            return cart;
        }
    }
}