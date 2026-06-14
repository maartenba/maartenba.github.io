---
layout: post
title: "Translating routes (ASP.NET MVC and Webforms)"
pubDatetime: 2010-01-26T07:12:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/01/26/translating-routes-asp-net-mvc-and-webforms.html
---
![Localized route in ASP.NET MVC - Translated route in ASP.NET MVC](/images/image_30.png) For one of the first blog posts of the new year, I thought about doing something cool. And being someone working with ASP.NET MVC, I thought about a cool thing related to that: let’s do something with routes! Since *System.Web.Routing* is not limited to ASP.NET MVC, this post will also play nice with ASP.NET Webforms. But what’s the cool thing? How about… translating route values?

Allow me to explain… I’m tired of seeing URLs like [http://www.example.com/en/products](http://www.example.com/en/products) and [http://www.example.com/nl/products](http://www.example.com/nl/products). Or something similar, with query parameters like “?culture=en-US”. Or even worse stuff. Wouldn’t it be nice to have [http://www.example.com/products](http://www.example.com/products) mapping to the English version of the site and [http://www.exaple.com/producten](http://www.exaple.com/producten) mapping to the Dutch version? Better to remember when giving away a link to someone, better for SEO as well.

Of course, we do want both URLs above to map to the *ProductsController* in our ASP.NET MVC application. We do not want to duplicate logic because of a language change, right? And what’s more: it’s not fun if this would mean having to switch from *<%=Html.ActionLink(…)%>* to something else because of this.

Let’s see if we can leverage the routing engine in* System.Web.Routing* for this…

Want the sample code? Check [LocalizedRouteExample.zip (23.25 kb)](/files/2013/2/LocalizedRouteExample.zip)

## Mapping a translated route

First things first: here’s how I see a translated route being mapped in *Global.asax.cs*:

```csharp
routes.MapTranslatedRoute(
    "TranslatedRoute",
    "{controller}/{action}/{id}",
    new { controller = "Home", action = "Index", id = "" },
    new { controller = translationProvider, action = translationProvider },
    true
);

```

Looks pretty much the same as you would normally map a route, right? There’s only one difference: the *new { controller = translationProvider, action = translationProvider }* line of code. This line of code basically tells the routing engine to use the object *translationProvider* as a provider which allows to translate a route value. In this case, the same translation provider will handle translating controller names and action names.

## Translation providers

The translation provider being used can actually be anything, as long as it conforms to the following contract:

```csharp
public interface IRouteValueTranslationProvider
{
    RouteValueTranslation TranslateToRouteValue(string translatedValue, CultureInfo culture);
    RouteValueTranslation TranslateToTranslatedValue(string routeValue, CultureInfo culture);
}

```

This contract provides 2 method definitions: one for mapping a translated value to a route value (like: mapping the Dutch “Thuis” to “Home”). The other method will do the opposite.

## TranslatedRoute

The “core” of this solution is the *TranslatedRoute* class. It’s basically an overridden implementation of the* System.Web.Routing.Route* class, using the *IRouteValueTranslationProvider* for translating a route. As a bonus, it also tries to set the current thread culture to the *CultureInfo* detected based on the route being called. Note that this is just a reasonable guess, not the very truth. It will not detect nl-NL versus nl-BE, for example. Here’s the code:

```csharp
public class TranslatedRoute : Route
{
    // ...
    public RouteValueDictionary RouteValueTranslationProviders { get; private set; }
    // ...
    public override RouteData GetRouteData(HttpContextBase httpContext)
    {
        RouteData routeData = base.GetRouteData(httpContext);
        if (routeData == null) return null;
        // Translate route values
        foreach (KeyValuePair<string, object> pair in this.RouteValueTranslationProviders)
        {
            IRouteValueTranslationProvider translationProvider = pair.Value as IRouteValueTranslationProvider;
            if (translationProvider != null
                && routeData.Values.ContainsKey(pair.Key))
            {
                RouteValueTranslation translation = translationProvider.TranslateToRouteValue(
                    routeData.Values[pair.Key].ToString(),
                    CultureInfo.CurrentCulture);
                routeData.Values[pair.Key] = translation.RouteValue;
                // Store detected culture
                if (routeData.DataTokens[DetectedCultureKey] == null)
                {
                    routeData.DataTokens.Add(DetectedCultureKey, translation.Culture);
                }
                // Set detected culture
                if (this.SetDetectedCulture)
                {
                    System.Threading.Thread.CurrentThread.CurrentCulture = translation.Culture;
                    System.Threading.Thread.CurrentThread.CurrentUICulture = translation.Culture;
                }
            }
        }
        return routeData;
    }
    public override VirtualPathData GetVirtualPath(RequestContext requestContext, RouteValueDictionary values)
    {
        RouteValueDictionary translatedValues = values;
        // Translate route values
        foreach (KeyValuePair<string, object> pair in this.RouteValueTranslationProviders)
        {
            IRouteValueTranslationProvider translationProvider = pair.Value as IRouteValueTranslationProvider;
            if (translationProvider != null
                && translatedValues.ContainsKey(pair.Key))
            {
                RouteValueTranslation translation =
                    translationProvider.TranslateToTranslatedValue(
                        translatedValues[pair.Key].ToString(), CultureInfo.CurrentCulture);
                translatedValues[pair.Key] = translation.TranslatedValue;
            }
        }
        return base.GetVirtualPath(requestContext, translatedValues);
    }
}

```

The *GetRouteData* finds a corresponding route translation if I entered “/Thuis/Over” in the URL. The *GetVirtualPath* method does the opposite, and will be used for mapping a call to *<%=Html.ActionLink(“About”, “About”, “Home”)%>* to a route like “/Thuis/Over” if the current thread culture is nl-NL. This is not rocket science, it simply tries to translate every token in the requested path and update the route data with it so the ASP.NET MVC subsystem will know that “Thuis” maps to *HomeController*.

## Tying everything together

We already tied the route definition in* Global.asax.cs* earlier in this blog post, but let’s do it again with a sample *DictionaryRouteValueTranslationProvider* that will be used for translating routes. This one goes in *Global.asax.cs*:

```csharp
public static void RegisterRoutes(RouteCollection routes)
{
    CultureInfo cultureEN = CultureInfo.GetCultureInfo("en-US");
    CultureInfo cultureNL = CultureInfo.GetCultureInfo("nl-NL");
    CultureInfo cultureFR = CultureInfo.GetCultureInfo("fr-FR");
    DictionaryRouteValueTranslationProvider translationProvider = new DictionaryRouteValueTranslationProvider(
        new List<RouteValueTranslation> {
            new RouteValueTranslation(cultureEN, "Home", "Home"),
            new RouteValueTranslation(cultureEN, "About", "About"),
            new RouteValueTranslation(cultureNL, "Home", "Thuis"),
            new RouteValueTranslation(cultureNL, "About", "Over"),
            new RouteValueTranslation(cultureFR, "Home", "Demarrer"),
            new RouteValueTranslation(cultureFR, "About", "Infos")
        }
    );
    routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
    routes.MapTranslatedRoute(
        "TranslatedRoute",
        "{controller}/{action}/{id}",
        new { controller = "Home", action = "Index", id = "" },
        new { controller = translationProvider, action = translationProvider },
        true
    );
    routes.MapRoute(
        "Default",      // Route name
        "{controller}/{action}/{id}",   // URL with parameters
        new { controller = "Home", action = "Index", id = "" }  // Parameter defaults
    );
}

```

This is basically it! What I can now do is set the current thread’s culture to, let’s say fr-FR, and all action links generated by ASP.NET MVC will be using French. Easy? Yes! Cool? Yes!

[![](/images/image_thumb_9.png)](/images/image_31.png)

Want the sample code? Check [LocalizedRouteExample.zip (23.25 kb)](/files/2013/2/LocalizedRouteExample.zip)
