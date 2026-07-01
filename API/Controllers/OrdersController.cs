using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Extensions;
using Domain.Entities;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class OrdersController(ICartService cartService, IUnitOfWork unit) : BaseApiController
    {
        [HttpPost]

        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            var email = User.GetEmail();

            var cart = await cartService.GetCartAsync(orderDto.CartId);

            if (cart == null) return BadRequest("Problem retrieving cart");

            if (cart.PaymentIntentId == null) return BadRequest("Payment Intent Id is required");

            var items = new List<OrderItem>();

            foreach (var item in cart.Items)
            {
                var productItem = await unit.Repository<Product>().GetByIdAsync(item.ProductId);

                if (productItem == null) return BadRequest("Problem with the order");

                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    ImageUrl = item.ImageUrl
                };

                var orderItem = new OrderItem
                {
                    ItemOrdered = itemOrdered,
                    Price = item.Price,
                    Quantity = item.Quantity
                };

                items.Add(orderItem);
            }

            var deliveryMethod = await unit.Repository<DeliveryMethod>().GetByIdAsync(orderDto.DeliveryMethodId);

            if (deliveryMethod == null) return BadRequest("No delivery method found");

            var order = new Order
            {
                OrderItems = items,
                DeliveryMethod = deliveryMethod,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = items.Sum(i => i.Price * i.Quantity),
                Discount = orderDto.Discount,
                PaymentSummary = orderDto.PaymentSummary,
                PaymentIntentId = cart.PaymentIntentId,
                BuyerEmail = email
            };

            unit.Repository<Order>().Add(order);

            if (await unit.Complete()) return Ok(order);

            return BadRequest("Problem creating order");
        }

        [HttpGet]

        public async Task<ActionResult<IReadOnlyList<OrderDto>>> GetOrdersForUser()
        {
            var spec = new OrderSpecification(User.GetEmail());
            var orders = await unit.Repository<Order>().ListAsync(spec);

            var ordersToReturn = orders.Select(o => o.ToDto()).ToList();

            return Ok(ordersToReturn);
        }

        [HttpGet("{id:int}")]

        public async Task<ActionResult<OrderDto>> GetOrderById(int id)
        {
            var spec = new OrderSpecification(User.GetEmail(), id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return NotFound();

            return Ok(order.ToDto());
        }
     

        
    }
}