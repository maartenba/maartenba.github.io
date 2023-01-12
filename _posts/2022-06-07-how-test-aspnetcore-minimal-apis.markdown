---
layout: post
title: "How to test ASP.NET Core Minimal APIs"
date: 2022-06-07 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", ".NET", "dotnet", "Testing"]
author: Maarten Balliauw
canonical_url: https://www.twilio.com/blog/test-aspnetcore-minimal-apis
---

How do you test that your [ASP.NET Core Minimal API](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis) behaves as expected? Do you need to deploy your application? Can you write tests with frameworks like [xUnit](https://xunit.net/), [NUnit](https://nunit.org/), or [MSTest](https://docs.microsoft.com/en-us/dotnet/core/testing/unit-testing-with-mstest)?

In this post, you will learn the basics of testing ASP.NET Core Minimal APIs. You’ll get started with testing a “hello world” endpoint, and then test a more complex API that returns JSON data. You’ll finish with customizing the ASP.NET Core service collection, so you can customize services for your unit tests and integration tests.

By the end of this post, you will have a good understanding of how to make sure your ASP.NET Core Minimal APIs behave as expected and can be deployed to production, even on Fridays!

> This post was originally published on the [Twilio blog](https://www.twilio.com/blog/) on June 06, 2022: [How to test ASP.NET Core Minimal APIs](https://www.twilio.com/blog/test-aspnetcore-minimal-apis)

## Prerequisites

* An OS that supports .NET (Windows/macOS/Linux)
* A .NET IDE (such as [JetBrains Rider](https://www.jetbrains.com/rider/))
* .NET 6.0 SDK or later

You can find [the source code for this tutorial on GitHub](https://github.com/maartenba/TwilioTestingMinimalAPI). Use it as a reference if you run into any issues.

## Create a test project

To get started, you will need to create a solution with two projects: an ASP.NET Core Minimal API that will contain the application, and a unit test project that will contain the tests. In this blog post, you will use [xUnit](https://xunit.net/) as the testing framework.

You can create this solution in your favorite .NET IDE, or using the .NET CLI. In the command line or terminal window, navigate to the folder you want your project to be created in, and run the following commands:

```bash
dotnet new web -o MyMinimalApi
dotnet new xunit -o MyMinimalApi.Tests
dotnet add MyMinimalApi.Tests reference MyMinimalApi
dotnet new sln
dotnet sln add MyMinimalApi
dotnet sln add MyMinimalApi.Tests
```

You now have a _MyMinimalApi.sln_ file, and two projects (_MyMinimalApi.csproj_ for the ASP.NET Core Minimal API, and _MyMinimalApi.Tests.csproj_ for the unit tests) with some template code. The test project also has a project reference to the Minimal API project.

To run the Minimal API application, you can use the .NET CLI and specify the project to run:

```bash
dotnet run --project MyMinimalApi
```

The tests can be run using the following .NET CLI command:

```bash
dotnet test
```

There’s not a lot of useful code in these projects yet. The Minimal API project contains a _Program.cs_ file with an endpoint that returns the string “Hello World!”:

```csharp
var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
```

The test project (_MyMinimalApi.Tests.csproj_) contains a template unit test file _UnitTest1.cs_ that you will replace later in this article.


## Update the test project

Before you can start testing your Minimal API, you will need to make some updates to the test project. The unit tests need to be able to use the ASP.NET Core framework, so you’ll have to bring that in somehow. The easiest way to do this is by adding a reference to the `Microsoft.AspNetCore.Mvc.Testing` package. This package also comes with several helper classes that are invaluable when writing unit tests later on.

Add this package using your favorite IDE, or use the .NET CLI:

```bash
dotnet add MyMinimalApi.Tests package Microsoft.AspNetCore.Mvc.Testing
```

The _MyMinimalApi.Tests.csproj_ file now looks like this:

```xml
<Project Sdk="Microsoft.NET.Sdk">

  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>

    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Mvc.Testing" Version="6.0.0" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.1.0" />
    <PackageReference Include="xunit" Version="2.4.1" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.4.3">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="coverlet.collector" Version="3.1.2">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\MinimalAPI\MinimalAPI.csproj" />
  </ItemGroup>

</Project>
```

You can now start writing unit tests for your Minimal API.


## “Hello World” and the ASP.NET Core test server

In the Minimal API project, _Program.cs_ already defines a “Hello World!” endpoint. You will test this endpoint first. Before you can do this, you will need to add the following public partial class definition at the bottom of _Program.cs_:

```csharp
`public partial class Program { }`
```

The reason why you need this partial class definition, is that by default the _Program.cs_ file is compiled into a private class `Program`, which can not be accessed by other projects. By adding this public partial class, the test project will get access to `Program` and lets you write tests against it.

In the _MyMinimalApi.Tests_ project, rename the _UnitTest1.cs_ file to _HelloWorldTests.cs_ and update the code:

```csharp
namespace MyMinimalApi.Tests;

using Microsoft.AspNetCore.Mvc.Testing;

public class HelloWorldTests
{
    [Fact]
    public async Task TestRootEndpoint()
    {

    }
}
```

The `TestRootEndpoint()` test will have to do a couple of things:

* Start the ASP.NET Core Minimal API
* Create an HTTP client for to connect to the application
* Send an HTTP request to the `/` endpoint
* Verify the response

Earlier in this post, you have added a reference to the `Microsoft.AspNetCore.Mvc.Testing` package. This package contains the `WebApplicationFactory<T>`, which is an important building block for testing ASP.NET Core applications.

The `WebApplicationFactory<T>` class creates an in-memory application that you can test. It  handles bootstrapping of your application, and provides an `HttpClient` that you can use to make requests.

Update the code in the `TestRootEndpoint()` method:

```csharp
[Fact]
public async Task TestRootEndpoint()
{
    await using var application = new WebApplicationFactory<Program>();
    using var client = application.CreateClient();

    var response = await client.GetStringAsync("/");

    Assert.Equal("Hello World!", response);
}
```

The code uses `WebApplicationFactory<Program>`. Here’s the reason you had to add that public partial class! You can use other public classes from the Minimal API project as well, but I personally prefer `Program` as it’s there in every project.

You can run this test using the .NET CLI, and look at the results:

```bash
> dotnet test

Microsoft (R) Test Execution Command Line Tool Version 17.2.0 (x64)
Copyright (c) Microsoft Corporation.  All rights reserved.

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:     1, Skipped:     0, Total:     1, Duration: < 1 ms - MyMinimalApi.Tests.dll (net6.0)
```

The test you created has just started your Minimal API application using the `WebApplicationFactory<Program>`, and uses an `HttpClient` that was returned by `application.CreateClient()`. Using this client, the test makes an HTTP GET request to the `/` endpoint. In this example, you used the `GetStringAsync("/")` method to do this. The test then asserts the response matches what is expected.

**Congratulations, you have just created your first test for an ASP.NET Core Minimal API!**

## Update the Minimal API project

Let’s spice things up a little! In most APIs, endpoints will work with JSON payloads in requests and responses. An API endpoint may return different results depending on the request that is being made. It may return a `200 OK` status code on success, and a `400 Bad Request` status code with more details in the response body when the request was not valid.

In this section, you will add such an endpoint to the Minimal API. This endpoint will also perform validation of the request, using the [MiniValidation package](https://www.nuget.org/packages/MiniValidation/).

Add this package using your favorite IDE, or use the .NET CLI:

```bash
dotnet add MyMinimalApi package MiniValidation --prerelease
```

> **Info:** [MiniValidation](https://github.com/DamianEdwards/MiniValidation) is a library intended to bring model validation to ASP.NET Core Minimal APIs. It currently only has pre-release packages available. When a stable version lands you should consider dropping the `--prerelease` version.

When that is installed, add a `Person` class to your Minimal API. This class will be used as a request payload later on.

```csharp
public class Person
{
    [Required, MinLength(2)]
    public string? FirstName { get; set; }

    [Required, MinLength(2)]
    public string? LastName { get; set; }

    [Required, DataType(DataType.EmailAddress)]
    public string? Email { get; set; }
}
```

Note that the `Person` class adds [validation attributes from the `System.ComponentModel.DataAnnotations` namespace](https://docs.microsoft.com/en-us/dotnet/api/system.componentmodel.dataannotations?view=net-6.0). Add `using System.ComponentModel.DataAnnotations;` to the top of your _Program.cs_ file to include the namespace . The `MiniValidation` packages you added earlier can process these attributes and validate the request is well-formed.

The Minimal API will also need to be able to store the `Person` in a data store. While modeling this data store is not in the scope of this article, you can define an `IPeopleService` interface to interact with the data store, and a `PeopleService` class that implements this interface:

```csharp
public interface IPeopleService
{
    string Create(Person person);
}

public class PeopleService: IPeopleService
{
    public string Create(Person person)
        => $"{person.FirstName} {person.LastName} created.";
}
```

> **Info:** In real projects, the `PeopleService` could use [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/) or other storage mechanisms to do something more useful.

It’s now time to register the `IPeopleService` with the ASP.NET Core service collection, so your API endpoint can make use of it. Add it as a scoped service to make sure a new instance of `PeopleService` is created each time a request comes in:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IPeopleService, PeopleService>();

// ...
```

You are doing great! As a final step in this section, you will implement the actual API endpoint in your Minimal API. This endpoint will listen for `POST` requests on `/people`, and accept a `Person` object in the request body. After the endpoint validates the incoming request, the API either uses the `IPeopleService` to store the object in the database, or returns a validation result.

```csharp
app.MapPost("/people", (Person person, IPeopleService peopleService) =>
    !MiniValidator.TryValidate(person, out var errors)
        ? Results.ValidationProblem(errors)
        : Results.Ok(peopleService.Create(person)));
```

Add `using MiniValidation;` to your using statements at the top of _Program.cs_ class so you can use the `MiniValidator` class.

Just to make sure, here’s what your _Program.cs_ should now look like:

```csharp
using System.ComponentModel.DataAnnotations;
using MiniValidation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IPeopleService, PeopleService>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapPost("/people", (Person person, IPeopleService peopleService) =>
    !MiniValidator.TryValidate(person, out var errors)
        ? Results.ValidationProblem(errors)
        : Results.Ok(peopleService.Create(person)));

app.Run();

public partial class Program { }

public interface IPeopleService
{
    string Create(Person person);
}

public class PeopleService : IPeopleService
{
    public string Create(Person person)
        => $"{person.FirstName} {person.LastName} created.";
}

public class Person
{
    [Required, MinLength(2)]
    public string? FirstName { get; set; }

    [Required, MinLength(2)]
    public string? LastName { get; set; }

    [Required, DataType(DataType.EmailAddress)]
    public string? Email { get; set; }
}
```

If you want to, you can run the Minimal API and test the `/people` endpoint from your terminal`.

First, start your Minimal API using `dotnet run --project MyMinimalApi` and look for the localhost URL in the output.

If you have the `curl` command available in your terminal, run:

```bash
curl -X POST --location "https://localhost:7230/people" \
    -H "Content-Type: application/json" \
    -d "{ \"FirstName\": \"Maarten\" }"
```

Or if you're using PowerShell, run:

```powershell
Invoke-WebRequest `
    -Uri https://localhost:7230/people `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"FirstName": "Maarten"}'
```

Replace the `https://localhost:7230` with the localhost URL that the `dotnet run` command printed to the console.

The response should be a `400 Bad request`, since the `LastName` and `Email` properties are required:

```
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json
Date: Fri, 03 Jun 2022 09:04:56 GMT
Server: Kestrel
Transfer-Encoding: chunked

{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "LastName": [
      "The LastName field is required."
    ],
    "Email": [
      "The Email field is required."
    ]
  }
}
```

After you confirm the endpoint works, you will convert this request into a test!


## Test different payloads and HTTP methods

Your Minimal API now has a `/people` endpoint. It has two possible response types: a `200 OK` that returns a string value, and a `400 Bad Request` that returns problem details as a JSON payload.

In the _MyMinimalApi.Tests_ project, add a _PeopleTests.cs_ file that contains the following code:

```csharp
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MyMinimalApi.Tests;

public class PeopleTests
{
    [Fact]
    public async Task CreatePerson()
    {
    }

    [Fact]
    public async Task CreatePersonValidatesObject()
    {
    }
}
```

The `PeopleTests` class now contains 2 test methods that you will need to implement:

* `CreatePerson()` to test the `200 OK` scenario
* `CreatePersonValidatesObject()` to test the `400 Bad Request` scenario

You will start with the `CreatePerson()` test method. The test will again make use of the `WebApplicationFactory<Program>` to create an in-memory HTTP client that you can use to validate the API.

```csharp
[Fact]
public async Task CreatePerson()
{
    await using var application = new WebApplicationFactory<Program>();

    var client = application.CreateClient();
}
```

Next, you will use the `client` to send a JSON payload to the `/people` endpoint. You can use the `PostAsJsonAsync()` method to send a JSON payload to the Minimal API under test. Finally, you can use the xUnit `Assert` class to validate the response status code and the response content.

Update the `CreatePerson()` test like below:

```csharp
[Fact]
public async Task CreatePerson()
{
    await using var application = new WebApplicationFactory<Program>();

    var client = application.CreateClient();

    var result = await client.PostAsJsonAsync("/people", new Person
    {
        FirstName = "Maarten",
        LastName = "Balliauw",
        Email = "maarten@jetbrains.com"
    });

    Assert.Equal(HttpStatusCode.OK, result.StatusCode);
    Assert.Equal("\"Maarten Balliauw created.\"", await result.Content.ReadAsStringAsync());
}
```

You can run this test using the .NET CLI, and confirm your Minimal API works as expected.

```bash
dotnet test
```

The `CreatePersonValidatesObject()` test is next. Like in the `CreatePerson()` test method, you will begin with creating a request to the in-memory Minimal API. Only this time, you will send an empty `Person` object.

Since all of its properties will be `null` or empty, the test should get back a `400 Bad Request`. You can assert this is indeed the case. What’s more, you can also use the `result.Content.ReadFromJsonAsync<>()` method to deserialize the validation problems, and verify they are as expected.

Update the `CreatePersonValidatesObject()` test like below:

```csharp
[Fact]
public async Task CreatePersonValidatesObject()
{
    await using var application = new WebApplicationFactory<Program>();

    var client = application.CreateClient();

    var result = await client.PostAsJsonAsync("/people", new Person());

    Assert.Equal(HttpStatusCode.BadRequest, result.StatusCode);

    var validationResult = await result.Content.ReadFromJsonAsync<HttpValidationProblemDetails>();
    Assert.NotNull(validationResult);
    Assert.Equal("The FirstName field is required.", validationResult!.Errors["FirstName"][0]);
}
```

I will leave the validation of the other properties as an exercise for you.

Again, try running this test using the .NET CLI, and confirm your Minimal API works as expected.

```bash
dotnet test
```

**Well done! You have now written tests that validate JSON payloads accepted and returned by your Minimal API!**

## Customizing the service collection

There’s one more thing… The Minimal API you created contains a `PeopleService` that, in a more real-life project, could need a database connection. This could be okay for some tests, and unnecessary for others.

The tests that you have written so far all have been validating the responses of the Minimal API. There’s no real need for the “real” implementation of `IPeopleService`, so let’s see how you can swap it out with a test implementation!

In the _MyMinimalApi.Tests_ project, create a new file _TestPeopleService.cs_ with the following code:

```csharp
public class TestPeopleService : IPeopleService
{
   public string Create(Person person) => "It works!";
}
```

The `TestPeopleService` class implements `IPeopleService` just like the real implementation does, but the `Create` method returns a simple `string` value.

Next, you will update the test methods to configure the `WebApplicationFactory<Program>` with a service override for `IPeopleService`, wiring it to `TestPeopleService` instead. You can do this in a number of ways: using the `WithWebHostBuilder()` and `ConfigureServices()` methods, or by implementing a custom `WebApplicationFactory<T>`. In this tutorial, you will use the first approach to change the `IPeopleService` to be a `TestPeopleService`.

Update the `CreatePerson` test with the following code:

```csharp
[Fact]
public async Task CreatePerson()
{
   await using var application = new WebApplicationFactory<Program>()
       .WithWebHostBuilder(builder => builder
           .ConfigureServices(services =>
           {
               services.AddScoped<IPeopleService, TestPeopleService>();
           }));

   var client = application.CreateClient();

   var result = await client.PostAsJsonAsync("/people", new Person
   {
       FirstName = "Maarten",
       LastName = "Balliauw",
       Email = "maarten@jetbrains.com"
   });

   Assert.Equal(HttpStatusCode.OK, result.StatusCode);
   Assert.Equal("\"It works!\"", await result.Content.ReadAsStringAsync());
}
```

To use `services.AddScoped`, add `using Microsoft.Extensions.DependencyInjection;` to your using statements at the top of the file.

Note that in the code sample, the final `Assert.Equal` is now testing for the `string` that is returned by `TestPeopleService`.

Depending on how many customizations you want to make to your Minimal API under test, you can move the `WithWebHostBuilder()` and `ConfigureServices()` methods out, and override the `WebApplicationFactory<T>` class. This has the advantage of having one place where you customize the service collection.

For example, you can create a `TestingApplication` class and override the `CreateHost` method to customize the service collection:

```csharp
class TestingApplication : WebApplicationFactory<Person>
{
   protected override IHost CreateHost(IHostBuilder builder)
   {
       builder.ConfigureServices(services =>
       {
           services.AddScoped<IPeopleService, TestPeopleService>();
       });

       return base.CreateHost(builder);
   }
}
```

You can use it in tests by replacing `new WebApplicationFactory<Program>` with `new TestingApplication()`:

```csharp
[Fact]
public async Task CreatePerson()
{
   await using var application = new TestingApplication();

   var client = application.CreateClient();

   var result = await client.PostAsJsonAsync("/people", new Person
   {
       FirstName = "Maarten",
       LastName = "Balliauw",
       Email = "maarten@jetbrains.com"
   });

   Assert.Equal(HttpStatusCode.OK, result.StatusCode);
   Assert.Equal("\"It works!\"", await result.Content.ReadAsStringAsync());
}
```

If you want to start customizing the Minimal API during tests, make sure to explore the various methods of `WebApplicationFactory<T>` that you can override to configure your application for the tests you are writing.

## Conclusion

That’s it! You just built several tests for an ASP.NET Core Minimal API, and validated it behaves as expected. You started out with testing a basic endpoint that returned a string, and then saw how to work with different HTTP methods and payloads on the request and response. You even customized the ASP.NET Core service collection with custom services for your tests.

Whether you are writing unit tests, integration tests or both, you should now have a good understanding of how to go about using the test server and customizing the service collection for many scenarios.

If you’re hungry for more, check out the [Microsoft docs on integration testing](https://docs.microsoft.com/en-us/aspnet/core/test/integration-tests).
