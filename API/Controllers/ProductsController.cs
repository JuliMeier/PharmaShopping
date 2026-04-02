using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;

    public ProductsController(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts(string? brand, string? type, string? sort)
    {
       return Ok(await _productRepository.GetProductsAsync(brand, type, sort));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await _productRepository.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound();
        }
        return product;
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        _productRepository.AddProduct(product);

        if(await _productRepository.SaveChangesAsync())
        {
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }
        return BadRequest("Failed to create product.");
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Product>> UpdateProduct(int id, Product product)
    {
       
        if (product.Id != id || !ProductExists(id))
        {
            return BadRequest("Cannot update product. Product ID mismatch or product does not exist.");
        }

        _productRepository.UpdateProduct(product);

        if(await _productRepository.SaveChangesAsync())
        {
            return NoContent();
        }
        return BadRequest("Failed to update product.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(int id)
    {
        var product = await _productRepository.GetProductByIdAsync(id);
        if (product == null)
        {
            return NotFound();
        }

        _productRepository.DeleteProduct(product);
        
        if(await _productRepository.SaveChangesAsync())
        {
            return NoContent();
        }
        return BadRequest("Failed to delete product.");
    }

    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var brands = await _productRepository.GetBrandsAsync();
        return Ok(brands);
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var types = await _productRepository.GetTypesAsync();
        return Ok(types);
    }

    private bool ProductExists(int id)
    {
        return _productRepository.ProductExists(id);
    }


    
}