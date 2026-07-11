using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Entities.OrderAggregate;

namespace Domain.Specifications
{
    public class OrderSpecification : BaseSpecification<Order>
    {
        public OrderSpecification(string email) : base(o => o.BuyerEmail == email)
        {
            AddInclude(o => o.OrderItems);
            AddInclude(o => o.DeliveryMethod);
            AddOrderByDescending(o => o.OrderDate);
        }

        public OrderSpecification(string email, int id) : base(o => o.BuyerEmail == email && o.Id == id)
        {
            AddInclude("OrderItems");
            AddInclude("DeliveryMethod");
        }

        public OrderSpecification(string paymentIntentId, bool isPaymentIntent) : base(o => o.PaymentIntentId == paymentIntentId)
        {
            AddInclude("OrderItems");
            AddInclude("DeliveryMethod");
        }

        public OrderSpecification(OrderSpecParams specParams) : base ( x => 
            string.IsNullOrEmpty(specParams.Status) || x.Status == ParseStatus(specParams.Status)
        )
        {
            AddInclude("OrderItems");
            AddInclude("DeliveryMethod");
            ApplyPaging(specParams.PageSize * (specParams.PageIndex - 1), specParams.PageSize);
            AddOrderByDescending(o => o.OrderDate);
        }

        public OrderSpecification(int id) : base(x => x.Id == id)
        {
            AddInclude("OrderItems");
            AddInclude("DeliveryMethod");
        }

        private static OrderStatus? ParseStatus(string status)
        {
            return Enum.TryParse<OrderStatus>(status, true, out var result) ? result : null;
        }
    }

}