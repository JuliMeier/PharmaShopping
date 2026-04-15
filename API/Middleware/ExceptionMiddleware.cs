

using System.Net;
using System.Reflection.Metadata;
using API.Errors;

namespace API.Middleware
{
    public class ExceptionMiddleware(IHostEnvironment env, RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex, env);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception ex, IHostEnvironment env)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var response = env.IsDevelopment()
                ? new ApiErrorResponse(context.Response.StatusCode, ex.Message, ex.StackTrace)
                : new ApiErrorResponse(context.Response.StatusCode,ex.Message, "Internal Server Error");

           
            var options = new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase };
            var json = System.Text.Json.JsonSerializer.Serialize(response, options);

            return  context.Response.WriteAsync(json);
        }
    }
}