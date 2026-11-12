---
layout: post
title: "Hosting the .NET Aspire Dashboard as a Standalone Container in Azure Web Apps"
description: "Run the .NET Aspire dashboard as a standalone container in Azure Web Apps to view OpenTelemetry traces, metrics and logs, including the HTTP/2 and gRPC setup."
pubDatetime: 2026-08-19T07:00:00Z
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "Azure", "OpenTelemetry"]
author: Maarten Balliauw
---

Sometimes you just want a simple way to look at your traces, metrics, and logs without setting up a full observability stack. Just a UI where you can see what your applications are doing, without having to setup Azure Monitor, Grafana, Prometheus, Jaeger, etc. You don't always need durability or complex infrastructure.

The [.NET Aspire dashboard](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/standalone) does exactly that. It's a standalone container that receives OpenTelemetry data and shows it in a nice web UI. Everything lives in memory, nothing gets persisted to disk, and that may be just fine, especially for smaller or hobby projects. Sometimes "I can see my traces right now" is all you need. I've been running it on Azure Web Apps as a container, and it takes about 10 minutes to get going.

## 1. Setting up the container in Azure Web Apps

Create a new Azure Web App configured for containers, and point it at the official Aspire dashboard image, either the stable version or the nightly build:

- Stable: `mcr.microsoft.com/dotnet/aspire-dashboard:latest`
- Nightly: `mcr.microsoft.com/dotnet/nightly/aspire-dashboard:latest`

The [container image documentation](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/standalone?tabs=bash#start-the-container) has the full list of available tags if you prefer to pin to a specific version.

## 2. Configuring HTTP/2 and gRPC routing

This is important, and it cost me some time to figure out this step is needed. The OpenTelemetry protocol (OTLP) uses gRPC, and Azure Web Apps needs explicit configuration to route gRPC traffic correctly.

In the Azure Portal, navigate to your Web App's **Configuration > General settings > Platform settings**, and set **HTTP 2.0 Proxy** to **gRPC Only**.

Without this, gRPC calls from your applications to the dashboard's OTLP endpoint will fail silently or with cryptic errors. The [Azure Web Apps gRPC documentation](https://learn.microsoft.com/en-us/azure/app-service/configure-language-dotnetcore?pivots=platform-linux#use-grpc-in-app-service) explains the details.

## 3. Environment variables for the dashboard

The dashboard needs a handful of environment variables to configure ports, authentication, and telemetry limits. Here's a configuration that works:

| Variable                                      | Value              | Purpose                                                                                   |
| --------------------------------------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `ASPNETCORE_URLS`                             | `http://[::]:8181` | Dashboard UI listen address                                                               |
| `WEBSITES_PORT`                               | `8181`             | Tells Azure which port the container exposes for HTTP traffic (the PORT configured above) |
| `HTTP20_ONLY_PORT`                            | `18889`            | The gRPC/OTLP ingest port (HTTP/2 only)                                                   |
| `ASPIRE_ALLOW_UNSECURED_TRANSPORT`            | `true`             | Required when running behind a reverse proxy that terminates TLS                          |
| `DASHBOARD__APPLICATIONNAME`                  | `AcmeCorp`         | Display name shown in the dashboard header                                                |
| `DASHBOARD__FRONTEND__AUTHMODE`               | `BrowserToken`     | Requires a token to access the dashboard UI                                               |
| `DASHBOARD__FRONTEND__BROWSERTOKEN`           | _(your token)_     | The token users need to enter when accessing the dashboard                                |
| `DASHBOARD__OTLP__AUTHMODE`                   | `ApiKey`           | Protects the OTLP ingest endpoint with an API key                                         |
| `DASHBOARD__OTLP__PRIMARYAPIKEY`              | _(a GUID)_         | Primary API key for OTLP ingest                                                           |
| `DASHBOARD__OTLP__SECONDARYAPIKEY`            | _(a GUID)_         | Secondary key for rotation without downtime                                               |
| `DASHBOARD__OTLP__CORS__ALLOWEDORIGINS`       | `*`                | CORS for the OTLP endpoint (restrict this if you can)                                     |
| `DASHBOARD__TELEMETRYLIMITS__MAXLOGCOUNT`     | `15000`            | Max log entries kept in memory                                                            |
| `DASHBOARD__TELEMETRYLIMITS__MAXMETRICSCOUNT` | `40000`            | Max metric data points in memory                                                          |
| `DASHBOARD__TELEMETRYLIMITS__MAXTRACECOUNT`   | `15000`            | Max trace spans in memory                                                                 |
| `ASPIRE_DASHBOARD_TELEMETRY_OPTOUT`           | `true`             | Disables Aspire's own telemetry reporting                                                 |

The `BrowserToken` auth mode means anyone accessing the dashboard URL gets prompted for a token. Set this to something long and random. The OTLP API keys are GUIDs that your applications will send as a header when pushing telemetry data, keeping random people from flooding your dashboard with garbage.

The telemetry limits control how much data the dashboard keeps in memory before it starts evicting older entries. Tune these based on how much RAM your App Service plan gives you and how much data your applications generate.

The full list of configuration options is in the [Aspire dashboard configuration documentation](https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/dashboard/configuration).

## 4. Sending telemetry from your applications

On the application side, you configure OpenTelemetry as you normally would. At the minimum:

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing.AddAspNetCoreInstrumentation())
    .WithMetrics(metrics => metrics.AddAspNetCoreInstrumentation())
    .UseOtlpExporter();
```

The `UseOtlpExporter()` call picks up its configuration from environment variables. Set these on your application's Azure Web App (or wherever it runs):

| Variable                      | Value                                       |
| ----------------------------- | ------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `https://your-dashboard.azurewebsites.net/` |
| `OTEL_EXPORTER_OTLP_HEADERS`  | `x-otlp-api-key=(one of the GUIDs)`         |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | `grpc`                                      |
| `OTEL_SERVICE_NAME`           | `my-app-prod`                               |

The `x-otlp-api-key` value must match either the `DASHBOARD__OTLP__PRIMARYAPIKEY` or `DASHBOARD__OTLP__SECONDARYAPIKEY` you configured on the dashboard. The `OTEL_SERVICE_NAME` is how your application identifies itself in the dashboard UI, so pick something descriptive.

That's it. Deploy both, and your traces, metrics, and logs should start appearing in the Aspire dashboard. A lightweight telemetry setup that takes about 10 minutes to configure, and is likely to get Martin Thwaites scold me for it.
