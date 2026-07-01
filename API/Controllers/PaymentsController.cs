using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Extensions;
using API.SignalR;
using Domain.Entities;
using Domain.Entities.OrderAggregate;
using Domain.Interfaces;
using Domain.Specifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Stripe;

namespace API.Controllers
{
    public class PaymentsController(IPaymentService paymentService,
        IUnitOfWork unit, ILogger<PaymentsController> logger, 
        IConfiguration config, IHubContext<NotificationHub> hubContext) : BaseApiController
    {

        private readonly string _whSecret = config["StripeSettings:WhSecret"] ?? throw new Exception("Stripe webhook secret not configured");

        [Authorize]
        [HttpPost("{cartId}")]
        public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePaymentIntent(string cartId)
        {
            var cart = await paymentService.CreateOrUpdatePaymentIntent(cartId);

            if (cart == null) return BadRequest("Problem creating payment intent");

            return Ok(cart);
        }

        [HttpGet("delivery-methods")]
        public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
        {
            return Ok(await unit.Repository<DeliveryMethod>().ListAllAsync());
        }

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

            try
            {
                var stripeEvent = ConstructStripeEvent(json);

                if (stripeEvent.Data.Object is not PaymentIntent intent)
                {
                    return BadRequest("Invalid event data");
                }

                var handled = await HandlePaymentIntentSuccedded(intent);

                if (!handled)
                {
                    return StatusCode(StatusCodes.Status404NotFound, "Order not found, Stripe will retry");
                }

                return Ok();
            }

            catch (StripeException ex)
            {
                logger.LogError(ex, "Stripe webhook error");
                return StatusCode(StatusCodes.Status500InternalServerError, "Webhook processing failed");
            }

            catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error occurred");
                return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred");
            }
        }

        private async Task<bool> HandlePaymentIntentSuccedded(PaymentIntent intent)
        {
            if (intent.Status == "succeeded")
            {
                var spec = new OrderSpecification(intent.Id, true);

                Order? order = null;
                const int maxRetries = 5;
                const int retryDelayMs = 500;

                for (int i = 0; i < maxRetries; i++)
                {
                    order = await unit.Repository<Order>().GetEntityWithSpec(spec);
                    if (order != null) break;
                    logger.LogWarning("Order not found for PaymentIntent {PaymentIntentId}, attempt {Attempt}/{MaxRetries}. Waiting...", intent.Id, i + 1, maxRetries);
                    await Task.Delay(retryDelayMs);
                }

                if (order == null)
                {
                    logger.LogWarning("Order not found for PaymentIntent {PaymentIntentId} after {MaxRetries} attempts. Stripe will retry.", intent.Id, maxRetries);
                    return false;
                }

                var orderTotalInCents = (long)Math.Round(order.GetTotal() * 100,
                    MidpointRounding.AwayFromZero);

                if (orderTotalInCents != intent.Amount)
                {
                    order.Status = OrderStatus.PaymentMismatch;
                    //logger.LogWarning("Payment amount mismatch for order {OrderId}", order.Id);
                }
                else
                {
                    order.Status = OrderStatus.PaymentReceived;
                    //logger.LogInformation("Payment received for order {OrderId}", order.Id);
                }

                await unit.Complete();

                var connectionId = NotificationHub.GetConnectionIdByEmail(order.BuyerEmail);

                if (!string.IsNullOrEmpty(connectionId))
                {
                    await hubContext.Clients.Client(connectionId)
                        .SendAsync("OrderCompleteNotification", order.ToDto());
                }
            }

            return true;
        }

        private Event ConstructStripeEvent(string json)
        {
            try
            {
                return EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"], _whSecret);
            }
            catch (Exception ex)
            {
                
                logger.LogError(ex, "Failed to construct Stripe event");
                throw new StripeException("Invalid signature");
            }
        }
            
    }
}