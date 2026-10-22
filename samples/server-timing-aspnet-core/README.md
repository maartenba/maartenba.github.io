# Server-Timing in ASP.NET Core: full source

Complete code for the blog post [Server-Timing Headers in ASP.NET Core: Backend Metrics in Browser DevTools](https://blog.maartenballiauw.be/post/2026/10/22/server-timing-headers-in-aspnet-core.html). Kept here for future reference; it is not part of the published site.


Rather than assembling the middleware from the earlier examples, here are the complete types together with their registration. The optional OpenTelemetry integration is not included here.

The options and the request feature:

```csharp
public sealed class ServerTimingOptions
{
    public Func<HttpContext, bool> ShouldEmit { get; set; } = static _ => false;
}

public readonly record struct ServerTimingMetric(string Name, double DurationMs, string? Description);

public interface IServerTimingFeature
{
    void AddMetric(string name, TimeSpan duration, string? description = null);
    void AddMetric(string name, double durationMs, string? description = null);

    IReadOnlyList<ServerTimingMetric> Metrics { get; }
}

public sealed class ServerTimingFeature : IServerTimingFeature
{
    private readonly List<ServerTimingMetric> _metrics = [];
    private readonly Lock _sync = new();

    public void AddMetric(string name, TimeSpan duration, string? description = null)
        => AddMetric(name, duration.TotalMilliseconds, description);

    public void AddMetric(string name, double durationMs, string? description = null)
    {
        lock (_sync)
        {
            _metrics.Add(new ServerTimingMetric(name, durationMs, description));
        }
    }

    public IReadOnlyList<ServerTimingMetric> Metrics
    {
        get
        {
            lock (_sync)
            {
                return _metrics.ToArray();
            }
        }
    }
}
```

The header formatter:

```csharp
using System.Globalization;
using System.Text;

public static class ServerTimingHeader
{
    public static string Format(IEnumerable<ServerTimingMetric> metrics)
    {
        var builder = new StringBuilder();

        foreach (var metric in metrics)
        {
            if (builder.Length > 0)
            {
                builder.Append(", ");
            }

            builder.Append(SanitizeName(metric.Name));
            builder.Append(";dur=");
            builder.Append(metric.DurationMs.ToString("F1", CultureInfo.InvariantCulture));

            if (!string.IsNullOrEmpty(metric.Description))
            {
                builder.Append(";desc=\"");
                builder.Append(Escape(metric.Description));
                builder.Append('"');
            }
        }

        return builder.ToString();
    }

    private static string SanitizeName(string name)
    {
        if (string.IsNullOrEmpty(name))
        {
            return "unnamed";
        }

        return string.Create(name.Length, name, static (buffer, source) =>
        {
            for (var i = 0; i < source.Length; i++)
            {
                var c = source[i];
                buffer[i] = char.IsAsciiLetterOrDigit(c) || c is '_' or '-' ? c : '_';
            }
        });
    }

    private static string Escape(string description)
        => description.Replace("\\", "\\\\").Replace("\"", "\\\"");
}
```

The middleware, including the `ShouldEmit` check:

```csharp
using System.Diagnostics;
using Microsoft.Extensions.Options;

public sealed class ServerTimingMiddleware(RequestDelegate next, IOptions<ServerTimingOptions> options)
{
    private readonly ServerTimingOptions _options = options.Value;

    public async Task InvokeAsync(HttpContext context)
    {
        if (!_options.ShouldEmit(context))
        {
            await next(context);
            return;
        }

        var feature = new ServerTimingFeature();
        context.Features.Set<IServerTimingFeature>(feature);

        var startTimestamp = Stopwatch.GetTimestamp();

        context.Response.OnStarting(() =>
        {
            feature.AddMetric("total", Stopwatch.GetElapsedTime(startTimestamp), "Total");

            var header = ServerTimingHeader.Format(feature.Metrics);
            if (header.Length > 0)
            {
                context.Response.Headers.Append("Server-Timing", header);
            }

            return Task.CompletedTask;
        });

        await next(context);
    }
}
```

The registration and measurement extensions:

```csharp
using System.Diagnostics;

public static class ServerTimingApplicationBuilderExtensions
{
    public static IApplicationBuilder UseServerTiming(this IApplicationBuilder app)
        => app.UseMiddleware<ServerTimingMiddleware>();
}

public static class ServerTimingExtensions
{
    public static IDisposable Measure(this HttpContext context, string name, string? description = null)
    {
        var feature = context.Features.Get<IServerTimingFeature>();
        return feature is null
            ? NullScope.Instance
            : new TimingScope(feature, name, description);
    }

    private sealed class TimingScope(IServerTimingFeature feature, string name, string? description)
        : IDisposable
    {
        private readonly long _startTimestamp = Stopwatch.GetTimestamp();

        public void Dispose()
            => feature.AddMetric(name, Stopwatch.GetElapsedTime(_startTimestamp), description);
    }

    private sealed class NullScope : IDisposable
    {
        public static readonly NullScope Instance = new();
        public void Dispose() { }
    }
}
```

Registration in `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Your real authentication scheme goes here. The gating predicate below
// reads context.User, which is only populated once authentication has run.
builder.Services.AddAuthentication();

builder.Services.Configure<ServerTimingOptions>(options =>
{
    options.ShouldEmit = context =>
        context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment()
        || context.User.IsInRole("Diagnostics");
});

var app = builder.Build();

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.UseServerTiming();
app.MapControllers();

app.Run();
```

The earlier minimal pipeline put `UseServerTiming()` first so the total covered everything. Once the gating predicate reads `context.User`, the middleware has to run after `UseAuthentication()`, so it moves down the pipeline. The total then starts after authentication rather than at the very top. If you would rather measure the whole request, gate on something that does not need an authenticated user, such as the environment or a header, and keep the middleware early.

