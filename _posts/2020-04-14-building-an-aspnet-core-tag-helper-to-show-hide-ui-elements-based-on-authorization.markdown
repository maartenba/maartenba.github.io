---
layout: post
title: "Building an ASP.NET Core Tag Helper to Show/Hide UI Elements based on Authorization"
date: 2020-04-14 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Web", ".NET"]
author: Maarten Balliauw
---

In this post, let's see how we can create an ASP.NET Core Tag Helper to show or hide UI elements based on authorization policies. But before we do so, let's start with a quick introduction outlining why you may want to do this.

## Introduction

The web front-end of [SpeakerTravel](https://www.speaker.travel/), a side project that helps simplify travel booking for speakers at conferences and events, is built using ASP.NET MVC and Razor Pages. As it goes with many applications, there is going to be some point where you need authentication, and equally important, authorization.

Thanks to [policy-based authorization](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/policies), expressing authorization requirements becomes more flexible. In SpeakerTravel, there are several main resources (`Event`, `Traveller`, `BookingRequest`), and I've created the necessary [authorization handlers](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-3.1#authorization-handlers) and [requirements](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/policies?view=aspnetcore-3.1#authorization-handlers) to make it possible to write requirements such as a `BookingRequestApprovalRequirement`, which would check whether the current user can approve a booking request for a traveller in an event. These requirements can then be added to auhorization policies, and ultimately protect a Razor page (or MVC controller) using an `[Authorize(Policy = "CanApproveBookingRequest")]` attribute.

Sometimes you may want to show or hide a UI element in a page or view, based on the current user's identity and privileges. The authorization docs [have some examples](https://docs.microsoft.com/en-us/aspnet/core/security/authorization/views?view=aspnetcore-3.1) on how to do this, which essentially boil down to:

1. Injecting an `IAuthorizationService` into your views:
```csharp
@using Microsoft.AspNetCore.Authorization
@inject IAuthorizationService AuthorizationService
```

2. Writing an `if` statement to check authorization:
```csharp
if ((await AuthorizationService.AuthorizeAsync(User, Model, "CanApproveBookingRequest")).Succeeded)
{
    <a class="btn btn-success" role="button"
        asp-action="Approve" asp-route-id="Model.Id">Approve booking</a>
}
```

That is perfectly fine, but having all of those nice [tag helpers](https://docs.microsoft.com/en-us/aspnet/core/mvc/views/tag-helpers/intro?view=aspnetcore-3.1) for other things made me question putting `if`-statements in views. Instead, I wanted to make this look like the following:

```html
<a class="btn btn-success" role="button"
    asp-action="Approve"
    asp-route-id="Model.Id"
    asp-authpolicy="CanApproveBookingRequest">Approve booking</a>
```

Some will prefer the `if`-statement over this tag helper, as it is more visual. I was in that camp, yet after building this tag helper I can't say I miss those `if`s in view code. By all means, use what works for you.

## Creating a Tag Helper for View-Based Authorization

To create a tag helper, we will need to write a class that implements `TagHelper`. We will also need to annotate it with a `HtmlTargetElement` attribute, to specify which type of HTML tag we want our tag helper to be available for. Let's start with the rough outline of our tag helper!

### 1. Implement TagHelper and Specify the HtmlTargetElementAttribute

Here's the rough outline of our tag helper (no implementation yet):

```csharp
[HtmlTargetElement("*", Attributes = "asp-authpolicy,asp-route-id")]
public class ResourcePolicyAuthorizationTagHelper : TagHelper
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IAuthorizationService _authorizationService;

    public ResourcePolicyAuthorizationTagHelper(
        IHttpContextAccessor httpContextAccessor,
        IAuthorizationService authorizationService)
    {
        _httpContextAccessor = httpContextAccessor;
        _authorizationService = authorizationService;
    }

    [HtmlAttributeName("asp-authpolicy")]
    public string PolicyName { get; set; }

    [HtmlAttributeName("asp-route-id")]
    public string ResourceId { get; set; }

    public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
    {
        // ...
    }
}
```

We'll apply our tag helper to any HTML element, as long as it has an `asp-authpolicy` attribute (which policy to check against) and an `asp-route-id` attribute (what's the id of the resource to verify against) specified. Hence: `[HtmlTargetElement("*", Attributes = "asp-authpolicy,asp-route-id")]`.

When our helper executes, we will need to access the current HTTP context (via `IHttpContextAccessor`, don't forget to register it using `services.AddHttpContextAccessor();`). We will also make use of the `IAuthorizationService` that is available, to validate the authorization policy. We'll expect them in the constructor - ASP.NET Core's dependency injection will provide them to our tag helper.

There's also a `PolicyName` property, annotated with `[HtmlAttributeName("asp-authpolicy")]`. This property, thanks to the annotation, will be populated with the attribute value we specify in our view. We want the policy name available, and this is how to do that. The same applies to the `ResourceId` property.

What is very cool is that the properties that map to a tag helper HTML attribute, both [ReSharper](https://www.jetbrains.com/resharper/) and [Rider](https://www.jetbrains.com/rider) will show where that property is used in Razor!

![Find usages in ReSharper and Rider show where our tag helper is used in Razor](/images/2020/04/tag-helper-find-usages.png)

### 2. Implement the ProcessAsync method

The "business logic" of our tag helper will be in the `ProcessAsync` method. In here, we will do the following things:

* Do whatever the `TagHelper` base class has to do.
* If there is a current HTTP context, call `AuthorizeAsync` on the authorization service, passing in the resource id and the policy name.
* If that succeeds, do nothing. If not, hide the current tag.

In code, this looks like the following:

```csharp
public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
{
    await base.ProcessAsync(context, output);

    var httpContext = _httpContextAccessor.HttpContext;
    if (httpContext != null)
    {
       if (!(await _authorizationService.AuthorizeAsync(
           httpContext.User, new ResourceDescriptor(ResourceId), PolicyName)).Succeeded)
        {
            output.SuppressOutput();
        }
    }
}
```

Some notes and thoughts:

* If no HTTP context is available, theoretically the entire view will not work. This situation should never happen, but in case it happens, I don't care too much about the element still being visible. The Razor page/controller action still has an `[Authorize(...)]` attribute checking the authorization policy, so that's fine. If not, suppress the output for that edge case (?) as well.
* My authorization handlers and policies work off a `ResourceDescriptor` class that, in reality, holds both the resource type and id. Your situation may be different, so this tag handler and how it calls into the authorization service will probably look different in your situation.

Also, suppressing the HTML tag's output is not the only thing you can do. Let's say that instead of hiding the HTML element, we want to strip its `href` attribute so it still renders, but no longer has a link. That's perfectly possible!

```csharp
if (output.Attributes.TryGetAttribute("href", out var tagHelperAttribute))
{
    output.Attributes.Remove(tagHelperAttribute);
}
```

Our tag helper could add a "disabled" CSS class, or change the appearance of the element. For example, the full implementation in SpeakerTravel has an `asp-onfailpolicy` attribute which I can set to `RemoveLink` or `Hide`.

### 3. Register the Tag Helper in ViewImports

Before we can use our tag helper in any view, we'll have to register it in the `_ViewImports.cshtml` file. This can be done by either registering the specific tag helper, or registering any tag helper in a given namespace. I went with the latter, where `Caribou` is the namespace for my tag helper:

```csharp
@addTagHelper *, Caribou
```

### 4. Using our Tag Helper

After compiling the project, we can now use our tag helper!

```html
<a class="btn btn-success" role="button"
    asp-action="Approve"
    asp-route-id="Model.Id"
    asp-authpolicy="CanApproveBookingRequest">Approve booking</a>
```

If the `Model.Id` matches the `CanApproveBookingRequest` policy, our hyperlink will be rendered. If not, no HTML is emitted, and our button will not be visible.

When you are using ReSharper or Rider, try *Ctrl+click*-ing on the `asp-` attributes - it will show you which tag helper uses that specific attribute.

![Navigate from view to tag helper in ASP.NET Core and Razor pages](/images/2020/04/rider-navigate-view-to-tag-helper.png)

Enjoy!
