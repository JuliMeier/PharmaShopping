using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Domain.Entities;

namespace API.Controllers
{
    public class CouponsController(ICouponService couponService) : BaseApiController
    {
        [HttpGet("{code}")]
        public async Task<ActionResult<AppCoupon>> ValidateCoupon(string code)
        {
            var coupon = await couponService.GetCouponFromPromoCode(code);
            if (coupon == null) return BadRequest("Invalid voucher code");
            return coupon;
        }
    }
}