using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Extensions;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController(IUnitOfWork unit, IPaymentService paymentService) : BaseApiController
    {
        [HttpGet("orders")]
        public async Task<ActionResult<IReadOnlyList<Order>>> GetOrders([FromQuery]OrderSpecParams specParams)
        {
            var spec = new OrderSpecification(specParams);

            return await CreatePagedResult(unit.Repository<Order>(), spec, specParams.PageIndex, specParams.PageSize, 
                o => o.ToDto());
        }

        [HttpGet("orders/{id:int}")]

        public async Task<ActionResult<OrderDto>> GetOrderById(int id) 
        {
            var spec = new OrderSpecification(id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return BadRequest("No order with that id");

            return order.ToDto();
        }

        [HttpPost("orders/refund/{id:int}")]

        public async Task<ActionResult<OrderDto>> RefundOrder(int id)
        {
            var spec = new OrderSpecification(id);

            var order = await unit.Repository<Order>().GetEntityWithSpec(spec);

            if (order == null) return BadRequest("No order with that id");

            if (order.Status == OrderStatus.Pending) return BadRequest("Order is still pending, cannot refund");

            var result = await paymentService.RefundPayment(order.PaymentIntentId);

            if (result == "succeeded")
            {
                order.Status = OrderStatus.Refunded;
                
                await unit.Complete();

                return order.ToDto();
            }
            else
            {
                return BadRequest("Refund failed");
            }
        }

    }
}