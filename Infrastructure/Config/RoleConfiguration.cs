using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Config
{
    public class RoleConfiguration : IEntityTypeConfiguration<IdentityRole>
    {

        public void Configure(EntityTypeBuilder<IdentityRole> builder)
        {
            builder.HasData(
                new IdentityRole {Id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890", Name = "Admin", NormalizedName = "ADMIN" },
                new IdentityRole {Id = "b2c3d4e5-f6a7-8901-bcde-f12345678901", Name = "Customer", NormalizedName = "CUSTOMER" }
            );
        }
    }
}