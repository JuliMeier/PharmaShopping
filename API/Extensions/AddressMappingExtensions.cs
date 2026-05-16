using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using Domain.Entities;

namespace API.Extensions
{
    public static class AddressMappingExtensions
    {
        public static AddressDto? ToDto(this Address? address)
        {
            if (address == null) return null;

            return new AddressDto
            {
                Line1 = address.Line1,
                Line2 = address.Line2,
                City = address.City,
                State = address.State,
                ZipCode = address.ZipCode,
                Country = address.Country
            };
        }
        public static Address ToEntity(this AddressDto addressDto)
        {
            if (addressDto == null) throw new ArgumentNullException(nameof(addressDto), "AddressDto cannot be null");

            return new Address
            {
                Line1 = addressDto.Line1,
                Line2 = addressDto.Line2,
                City = addressDto.City,
                State = addressDto.State,
                ZipCode = addressDto.ZipCode,
                Country = addressDto.Country
            };
        }

        public static void UpdateFromDto (this Address address, AddressDto addressDto)
        {
            if (address == null) throw new ArgumentNullException(nameof(address), "Address cannot be null");
            if (addressDto == null) throw new ArgumentNullException(nameof(addressDto), "AddressDto cannot be null");

            address.Line1 = addressDto.Line1;
            address.Line2 = addressDto.Line2;
            address.City = addressDto.City;
            address.State = addressDto.State;
            address.ZipCode = addressDto.ZipCode;
            address.Country = addressDto.Country;
        }
    }

}