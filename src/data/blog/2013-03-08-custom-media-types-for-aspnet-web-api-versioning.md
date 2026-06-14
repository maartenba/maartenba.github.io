---
layout: post
title: "Custom media types for ASP.NET Web API versioning"
pubDatetime: 2013-03-08T12:25:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "WebAPI"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/03/08/custom-media-types-for-asp-net-web-api-versioning.html
  - /post/2013/03/08/custom-media-types-for-aspnet-web-api-versioning.html
---
There is a raging discussion on the interwebs on whether to version API’s by using their URL or by using a custom media type. Some argue that doing it in the URL breaks REST (since a different URL is a different resource while versions don’t necessarily mean a new resource is available). While I still feel good about both approaches, I guess it depends on the domain you are working with.

But that is not the topic of this talk. I recently found a [sample on CodePlex providing support for routing versioned URL’s](http://aspnet.codeplex.com/SourceControl/changeset/view/0e68a22781fd#Samples/WebApi/NamespaceControllerSelector/ReadMe.txt) to different namespaces. In short, it maps */api/v1/values* to *MyApp.V1.Controllers* and /*api/v2/values* to *MyApp.V2.Controllers*. Great! But that only supports the URL-versioning side of the discussion. Let’s implement this sample and build ASP.NET Web API support for versioning an API using custom media types…

## Custom Media Types

If you have no clue about what I am talking about, no worries. I’ll give you a quick primer on this using [the GitHub API](http://developer.github.com/v3/media/) as an example. Since their API version 3, endpoints for the API (or “resource addresses”) will no longer change every version of the API. Instead, they will be parsing the *Accept* HTTP header to determine the incoming message version and the expected response version.

Getting a list of repositories from the API? The URL will always be */users/repos*. However different incoming and outgoing responses are possible, varying based on their media types. Want to use the V3 message format in JSON? Use *application/vnd.github.v3+json*. Prefer the V3 message format in XML? Use* application/vnd.github.v3+xml*. Whenever they update their messages, they can add a new media type such as *application/vnd.github.v4* without changing any URL. Nifty trick, aye? Let’s do this for our own API.

## IHttpControllerSelector

The *IHttpControllerSelector* interface allows you to interfere in selecting the right controller for the current request. This is an ideal location for grabbing all contextual information and providing ASP.NET Web API with a controller based on that context.

```csharp
public class AcceptHeaderControllerSelector : IHttpControllerSelector
{
    private const string ControllerKey = "controller";

    private readonly HttpConfiguration _configuration;
    private readonly Func<MediaTypeHeaderValue, string> _namespaceResolver;
    private readonly Lazy<Dictionary<string, HttpControllerDescriptor>> _controllers;
    private readonly HashSet<string> _duplicates;

    public AcceptHeaderControllerSelector(HttpConfiguration config, Func<MediaTypeHeaderValue, string> namespaceResolver)
    {
        _configuration = config;
        _namespaceResolver = namespaceResolver;
        _duplicates = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        _controllers = new Lazy<Dictionary<string, HttpControllerDescriptor>>(InitializeControllerDictionary);
    }

    private Dictionary<string, HttpControllerDescriptor> InitializeControllerDictionary()
    {
        var dictionary = new Dictionary<string, HttpControllerDescriptor>(StringComparer.OrdinalIgnoreCase);

        // Create a lookup table where key is "namespace.controller". The value of "namespace" is the last
        // segment of the full namespace. For example:
        // MyApplication.Controllers.V1.ProductsController => "V1.Products"
        IAssembliesResolver assembliesResolver = _configuration.Services.GetAssembliesResolver();
        IHttpControllerTypeResolver controllersResolver = _configuration.Services.GetHttpControllerTypeResolver();

        ICollection<Type> controllerTypes = controllersResolver.GetControllerTypes(assembliesResolver);

        foreach (Type t in controllerTypes)
        {
            var segments = t.Namespace.Split(Type.Delimiter);

            // For the dictionary key, strip "Controller" from the end of the type name.
            // This matches the behavior of DefaultHttpControllerSelector.
            var controllerName = t.Name.Remove(t.Name.Length - DefaultHttpControllerSelector.ControllerSuffix.Length);

            var key = String.Format(CultureInfo.InvariantCulture, "{0}.{1}", segments[segments.Length - 1], controllerName);

            // Check for duplicate keys.
            if (dictionary.Keys.Contains(key))
            {
                _duplicates.Add(key);
            }
            else
            {
                dictionary[key] = new HttpControllerDescriptor(_configuration, t.Name, t);
            }
        }

        // Remove any duplicates from the dictionary, because these create ambiguous matches.
        // For example, "Foo.V1.ProductsController" and "Bar.V1.ProductsController" both map to "v1.products".
        foreach (string s in _duplicates)
        {
            dictionary.Remove(s);
        }
        return dictionary;
    }

    // Get a value from the route data, if present.
    private static T GetRouteVariable<T>(IHttpRouteData routeData, string name)
    {
        object result = null;
        if (routeData.Values.TryGetValue(name, out result))
        {
            return (T)result;
        }
        return default(T);
    }

    public HttpControllerDescriptor SelectController(HttpRequestMessage request)
    {
        IHttpRouteData routeData = request.GetRouteData();
        if (routeData == null)
        {
            throw new HttpResponseException(HttpStatusCode.NotFound);
        }

        // Get the namespace and controller variables from the route data.
        string namespaceName = null;
        foreach (var accepts in request.Headers.Accept)
        {
            namespaceName = _namespaceResolver(accepts);
            if (namespaceName != null)
            {
                break;
            }
        }
        if (namespaceName == null)
        {
            throw new HttpResponseException(HttpStatusCode.NotFound);
        }

        string controllerName = GetRouteVariable<string>(routeData, ControllerKey);
        if (controllerName == null)
        {
            throw new HttpResponseException(HttpStatusCode.NotFound);
        }

        // Find a matching controller.
        string key = String.Format(CultureInfo.InvariantCulture, "{0}.{1}", namespaceName, controllerName);

        HttpControllerDescriptor controllerDescriptor;
        if (_controllers.Value.TryGetValue(key, out controllerDescriptor))
        {
            return controllerDescriptor;
        }
        else if (_duplicates.Contains(key))
        {
            throw new HttpResponseException(
                request.CreateErrorResponse(HttpStatusCode.InternalServerError,
                "Multiple controllers were found that match this request."));
        }
        else
        {
            throw new HttpResponseException(HttpStatusCode.NotFound);
        }
    }

    public IDictionary<string, HttpControllerDescriptor> GetControllerMapping()
    {
        return _controllers.Value;
    }
}

```

To be honest, I did not write much code in this. I grabbed the *IHttpControllerSelector* implementation [from the sample on CodePlex](http://aspnet.codeplex.com/SourceControl/changeset/view/0e68a22781fd#Samples/WebApi/NamespaceControllerSelector/ReadMe.txt) and added just these lines to check the *Accept* header instead.

```csharp
// Get the namespace and controller variables from the route data.
string namespaceName = null;
foreach (var accepts in request.Headers.Accept)
{
    namespaceName = _namespaceResolver(accepts);
    if (namespaceName != null)
    {
        break;
    }
}
if (namespaceName == null)
{
    throw new HttpResponseException(HttpStatusCode.NotFound);
}

```

The real logic in finding out the version that is called is delegated to the user of this *IHttpControllerSelector*. Let’s wire it up!

## Wiring it up

ASP.NET Web API has a lot of “plugs”, among which there’s one where we can plug in our custom *IHttpControllerSelector*, Let’s override the default one and add our own:

```csharp
config.Services.Replace(typeof(IHttpControllerSelector),
    new AcceptHeaderControllerSelector(config, accept =>
        {
            foreach (var parameter in accept.Parameters)
            {
                if (parameter.Name.Equals("version", StringComparison.InvariantCultureIgnoreCase))
                {
                    switch (parameter.Value)
                    {
                        case "1.0": return "v1";
                        case "2.0": return "v2";
                    }
                }
            }

            return "v2"; // default namespace, return null to throw 404 when namespace not given
        }));

```

As you can see, we can pass in a lambda which gets called with the contents of the *Accept* header and must return the namespace obtained from the header. The above example will work when using the version property of a header, e.g.: *application/json;version=1.0* and *application/json;version=2.0*. The last statement returns “v2” as the default version when no specific media header is given. Return *null* if you want this to result in a *404 Page Not Found*.

Using this header scheme is recommended but of course other options are possible. It’s *your* lambda!

Another approach would be going "GitHub style" and use things like *application/vnd.api.v1+json *and similar?

```csharp
config.Services.Replace(typeof(IHttpControllerSelector),
    new AcceptHeaderControllerSelector(config, accept =>
        {
            var matches = Regex.Match(accept.MediaType, @"application\/vnd.api.(.*)\+.*");
            if (matches.Groups.Count >= 2)
            {
                return matches.Groups[1].Value;
            }
            return "v2"; // default namespace, return null to throw 404 when namespace not given
        }));

```

Note that when using the GitHub-style media type, it’s best to also configure the default media type formatters to recognize these new types. That way you can even use different media type formats for each API version.

```

// Add custom media types as supported to their default formatters
config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeWithQualityHeaderValue("application/vnd.api.v1+json"));
config.Formatters.JsonFormatter.SupportedMediaTypes.Add(new MediaTypeWithQualityHeaderValue("application/vnd.api.v2+json"));

config.Formatters.XmlFormatter.SupportedMediaTypes.Add(new MediaTypeWithQualityHeaderValue("application/vnd.api.v1+xml"));
config.Formatters.XmlFormatter.SupportedMediaTypes.Add(new MediaTypeWithQualityHeaderValue("application/vnd.api.v2+xml"));

```

That’s basically it. We can now implement our controllers in different namespaces, like so:

```csharp
namespace TestSelector.Controllers.V1
{
    public class ValuesController : ApiController
    {
        public string Get()
        {
            return "This is a V1 response.";
        }
    }
}

namespace TestSelector.Controllers.V2
{
    public class ValuesController : ApiController
    {
        public string Get()
        {
            return "This is a V2 response.";
        }
    }
}

```

When providing different *Accept *headers, we now get routed to the correct namespace depending on our custom media type. REST maturity level up!

I’ve issued a pull request on the [official samples page](http://aspnet.codeplex.com/SourceControl/BrowseLatest), in the meanwhile here’s the download: [AcceptHeaderControllerSelector.zip (238.43 kb)](/files/2013/3/AcceptHeaderControllerSelector.zip)

Enjoy!

**[edit]** there's a project on GitHub containing other implementations as well, check [http://github.com/Sebazzz/SDammann.WebApi.Versioning](http://github.com/Sebazzz/SDammann.WebApi.Versioning)
