---
layout: post
title: "Registering a type as an interface and as self with ASP.NET Core dependency injection"
date: 2018-10-19 04:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "ASP.NET"]
author: Maarten Balliauw
---

While I am a big fan of [Autofac](https://autofac.org/) to serve as the framework for making Inversion of Control (IoC) and Dependency Injection (DI) work in an application, it is quite convenient in simple projects to use the [built-in dependency injection in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection).

While [simple to replace the default one with Autofac](http://docs.autofac.org/en/latest/integration/aspnetcore.html), the default one is often sufficient. Unless it's not!

Consider the following component registration:

```csharp
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // ...
        
        services.AddTransient<ICustomerService, DefaultCustomerService>();
        
        // ...
    }
}
```

With the default [Microsoft.Extensions.DependencyInjection](https://www.nuget.org/packages/Microsoft.Extensions.DependencyInjection) package in ASP.NET Core, we can now consume an `ICustomerService` in, for example, our controllers:

```csharp
public class SupportController
{
    // DefaultCustomerService will be injected here:
    public SupportController(ICustomerService customerService)
    {
        // ...
    }
}
```

The above code will work fine, and where we expect a `ICustomerService`, we'll receive a `DefaultCustomerService` because that is what we registered.

Now what will happen if at some point we do want to be more specific? Let's say we have another controller where we really want to get a concrete `DefaultCustomerService` injected?

```csharp
public class AnotherController
{
    public AnotherController(DefaultCustomerService customerService)
    {
        // ...
    }
}
```

This will blow up with a nice exception!

> **An unhandled exception occurred while processing the request.**
> InvalidOperationException: Unable to resolve service for type 'DefaultCustomerService' while attempting to activate 'AnotherController'.
> ```Microsoft.Extensions.DependencyInjection.ActivatorUtilities.GetService(IServiceProvider sp, Type type, Type requiredBy, bool isDefaultParameterRequired)```

The reason for the `InvalidOperationException` we get is that the service collection only contains a registration for `ICustomerService`, and not for `DefaultCustomerService`.

## How to register a type as an interface and as self?

So how can we solve this and register a type as an interface and as self? Googling/Binging/DuckDuckGoing reveals many developers who ran into this issue, and recommend registering our service twice, in any of the following forms:

```csharp
// Using a factory to fetch the previously registered type
services.AddTransient<ICustomerService, DefaultCustomerService>();
services.AddTransient<DefaultCustomerService>(
    provider => provider.GetService<ICustomerService>());

// Using a concrete instance during registration,
// with the downside that this will always be registered as a singleton
/ (and that we lose dependency injection in DefaultCustomerService itself)
var customerService = new DefaultCustomerService();
services.AddTransient<ICustomerService>(customerService);
services.AddTransient<DefaultCustomerService>(customerService);
```

All of the above will work, but it looks... ugly. Especially when a few instances need to be registered like this. Wouldn't it be nice if ASP.NET Core's built-in service collection supported registering types as a specific interface, and `AsSelf()`, much like [Autofac supports](https://autofaccn.readthedocs.io/en/latest/register/registration.html)? Something like this:

```csharp
services.AddTransient<ICustomerService, DefaultCustomerService>().AsSelf();
```

The idea behind the ASP.NET Core dependency injection was that it should be sufficient for most scenario's, and that for more fine-grained control of dependencies we can always plug in another framework. But this is one of those cases where for one specific service we'd need an overhaul of service registrations... Why not "make it work"?

## Building an `AsSelf()` extension method

We can easily write an `AsSelf()` extension method on `IServiceCollection`, so that we can register a type "as self" as well. Our goal will be to write an extension method that pretty much resembles this solution from above:

```csharp
// Using a factory to fetch the previously registered type
services.AddTransient<ICustomerService, DefaultCustomerService>();
services.AddTransient<DefaultCustomerService>(
    provider => provider.GetService<ICustomerService>());
```

Disclaimer: this is not a perfect solution in all cases and can easily go wrong with more registrations. Plug another framework when needed!

### Boiler-plate extension method

With that out of the way, let's start. We'll extend `IServiceCollection`, and since we want the code to flow a bit nicer where `AsSelf()` will follow the previous registration, we are interested in that one:

```csharp
public static class ServiceCollectionHostedServiceExtensions
{
	/// <summary>
	/// Register the last registration as its own type.
	/// </summary>
	/// <returns>The original <see cref="T:Microsoft.Extensions.DependencyInjection.IServiceCollection" />.</returns>
	public static IServiceCollection AsSelf(this IServiceCollection services)
	{
		var lastRegistration = services.LastOrDefault();
		if (lastRegistration != null)
		{
			// TODO
		}

		return services;
	}
}
```

### Hardening

Let's also add some hardening: if the previous registration already is registered with the service type and implementation type being the same, we have no more work to do:

```csharp
var implementationType = GetImplementationType(lastRegistration);
		    
// When the last registration service type was already registered
// as its implementation type, bail out.
if (lastRegistration.ServiceType == implementationType)
{
    return services;
}
```

*Note that we use a `GetImplementationType()` helper method which is in the full extension method code below - it helps us find the implementation type regardless of whether the previous registration was a concrete instance registration, a type registration or a factory registration.*

### Registering a single instance "as self"

Next up, let's cover the easiest case first: *instance* registration. Concrete instances are always registered as a singleton in ASP.NET Core's dependency injection framework, so we can mimic this behavior:

```csharp
if (lastRegistration.ImplementationInstance != null)
{
	// Register "self" registration as the same instance
	services.Add(new ServiceDescriptor(
		implementationType, 
		lastRegistration.ImplementationInstance));
}
```

That's it, really. We repeat the last registration, just with the first argument passed to `ServiceDescriptor` as the implementation type instead of the service type. Our instance is now registered twice: once as the original registration, and once as its own type.

### Registering a type or a type factory "as self" - side-step

Next up: type registration and factory registration. This is a little bit more complex, because there is an edge case we must cover... Let's side-step for a bit. The code we GoogleBingDucked previously has an issue waiting to happen. Look at this registration:

```csharp
services.AddTransient<ICustomerService, DefaultCustomerService>();
services.AddTransient<DefaultCustomerService>(
    provider => provider.GetService<ICustomerService>());
```

Now what happens when we have multiple `ICustomerService` registered?

```csharp
services.AddTransient<ICustomerService, OtherCustomerService>();
services.AddTransient<ICustomerService, DefaultCustomerService>();
services.AddTransient<DefaultCustomerService>(
    provider => provider.GetService<ICustomerService>());
```

Exactly: our concrete type registration may return `OtherCustomerService` in this case (I haven't actually tried to run this, but it looks suspicious, right?)

So we want to rewrite our registration for this case, and come up with this instead:

```csharp
services.AddTransient<ICustomerService, OtherCustomerService>();
services.AddTransient<DefaultCustomerService>();
services.AddTransient<ICustomerService>(
    provider => provider.GetService<DefaultCustomerService>());
```

This would leave our original intent intact (multiple `ICustomerService`, but at least `DefaultCustomerService` would resolve the correct type.

### Registering a type or a type factory "as self"

Back to our extension method! We want to start by removing the previous service registration. That's easy, right?

```csharp
// Remove last registration
services.Remove(lastRegistration);
```

Next, we want to register our implementation type first, either using a factory method or as a type registration:

```csharp
// Register "self" registration first
if (lastRegistration.ImplementationFactory != null)
{
        // Factory-based
        services.Add(new ServiceDescriptor(
            implementationType,
            lastRegistration.ImplementationFactory,
            lastRegistration.Lifetime));
    }
    else
    {
        // Type-based
        services.Add(new ServiceDescriptor(
            implementationType,
            implementationType, 
            lastRegistration.Lifetime));
    }
```

Since we removed the original registration, let's re-add it with a small modification: instead of being a full copy of the original registration, we will use a factory method to resolve the implementation type we just registered:

```csharp
// Re-register last registration, proxying our specific registration
    services.Add(new ServiceDescriptor(
        lastRegistration.ServiceType,
        provider => provider.GetService(implementationType), 
        lastRegistration.Lifetime));
```

This method now helps us to register a type with the service collection twice, once as a service type and once as its own type, as intended:

```csharp
services.AddTransient<ICustomerService, DefaultCustomerService>().AsSelf();
```

### Completed extension method

Here's the complete extension method:

```csharp
public static class ServiceCollectionHostedServiceExtensions
{
	/// <summary>
	/// Register the last registration as its own type.
	/// </summary>
	/// <returns>The original <see cref="T:Microsoft.Extensions.DependencyInjection.IServiceCollection" />.</returns>
	public static IServiceCollection AsSelf(this IServiceCollection services)
	{
		var lastRegistration = services.LastOrDefault();
		if (lastRegistration != null)
		{
		    var implementationType = GetImplementationType(lastRegistration);
		    
            // When the last registration service type was already registered
            // as its implementation type, bail out.
            if (lastRegistration.ServiceType == implementationType)
            {
                return services;
            }
		    
			if (lastRegistration.ImplementationInstance != null)
			{
				// Register "self" registration as the same instance
				services.Add(new ServiceDescriptor(
					implementationType, 
					lastRegistration.ImplementationInstance));
			}
			else 
			{
				// Remove last registration
				services.Remove(lastRegistration);
			
				// Register "self" registration first
				if (lastRegistration.ImplementationFactory != null)
				{
					// Factory-based
					services.Add(new ServiceDescriptor(
						lastRegistration.ImplementationType,
						lastRegistration.ImplementationFactory,
						lastRegistration.Lifetime));
				}
				else
				{
					// Type-based
					services.Add(new ServiceDescriptor(
						lastRegistration.ImplementationType,
						lastRegistration.ImplementationType, 
						lastRegistration.Lifetime));
				}

				// Re-register last registration, proxying our specific registration
				services.Add(new ServiceDescriptor(
					lastRegistration.ServiceType,
					provider => provider.GetService(implementationType), 
					lastRegistration.Lifetime));
			}
		}

		return services;
	}
	
	private static Type GetImplementationType(ServiceDescriptor descriptor)
	{
		if (descriptor.ImplementationType != null)
		{
			return descriptor.ImplementationType;
		}

		if (descriptor.ImplementationInstance != null)
		{
			return descriptor.ImplementationInstance.GetType();
		}
		
		if (descriptor.ImplementationFactory != null)
		{
			return descriptor.ImplementationFactory.GetType().GenericTypeArguments[1];
		}

		return null;
	}
}
```

Again, this is not a perfect solution in all cases and can easily go wrong with more registrations. Plug another framework when needed! But for the simple cases where double registration is needed, this solution will work.

Enjoy!
