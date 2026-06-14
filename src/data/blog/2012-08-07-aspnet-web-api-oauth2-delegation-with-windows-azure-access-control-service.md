---
layout: post
title: "ASP.NET Web API OAuth2 delegation with Windows Azure Access Control Service"
pubDatetime: 2012-08-07T13:58:44Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Security", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/08/07/asp-net-web-api-oauth2-delegation-with-windows-azure-access-control-service.html
---
![OAuth 2 Windows Azure](/images/image_216.png)If you are familiar with OAuth2’s protocol flow, you know there’s a lot of things you should implement if you want to protect your ASP.NET Web API using OAuth2. To refresh your mind, here’s what’s required (at least):


- OAuth authorization server
- Keep track of consuming applications
- Keep track of user consent (yes, I allow application X to act on my behalf)
- OAuth token expiration & refresh token handling
- Oh, and your API


That’s a lot to build there. Wouldn’t it be great to outsource part of that list to a third party? A little-known feature of the Windows Azure Access Control Service is that you can use it to keep track of applications, user consent and token expiration & refresh token handling. That leaves you with implementing:


- OAuth authorization server
- Your API


Let’s do it!


*On a side note: I’m aware of the *[*road-to-hell post released last week*](http://hueniverse.com/2012/07/oauth-2-0-and-the-road-to-hell/)* on OAuth2. I still think that whoever offers OAuth2 should be responsible enough to implement the protocol in a secure fashion. The protocol gives you the options to do so, and, as with regular web page logins, you as the implementer should think about security.*


## Building a simple API


I’ve been doing some demos lately using [www.brewbuddy.net](http://www.brewbuddy.net), a sample application (sources [here](https://github.com/maartenba/BrewBuddy)) which enables hobby beer brewers to keep track of their recipes and current brews. There are a lot of applications out there that may benefit from being able to consume my recipes. I love the smell of a fresh API in the morning!


Here’s an API which would enable access to my BrewBuddy recipes:


 1 [Authorize]
 2 public class RecipesController
 3     : ApiController
 4 {
 5     protected IRecipeService RecipeService { get; private set; }
 6
 7     public RecipesController(IRecipeService recipeService)
 8     {
 9         RecipeService = recipeService;
10     }
11
12     public IQueryable<RecipeViewModel> Get()
13     {
14         var recipes = RecipeService.GetRecipes(User.Identity.Name);
15         var model = AutoMapper.Mapper.Map(recipes, new List<RecipeViewModel>());
16
17         return model.AsQueryable();
18     }
19 }</pre>

Nothing special, right? We’re just querying our *RecipeService* for the current user’s recipes. And the current user should be logged in as specified using the* [Authorize]* attribute.  Wait a minute! The current user?

I’ve built this API on the standard ASP.NET Web API features such as the *[Authorize]* attribute and the expectation that the *User.Identity.Name* property is populated. The reason for that is simple: my API requires a user and should not care how that user is populated. If someone wants to consume my API by authenticating over Forms authentication, fine by me. If someone configures IIS to use Windows authentication or even hacks in basic authentication, fine by me. My API shouldn’t care about that.

## OAuth2 is a different state of mind

OAuth2 adds a layer of complexity. Mental complexity that is. Your API consumer is *not* your end user. Your API consumer is acting on behalf of your end user. That’s a huge difference! Here’s what really happens:

[![](/images/image_thumb_181.png)](/images/image_217.png)

The end user loads a consuming application (a mobile app or a web app that doesn’t really matter). That application requests a token from an authorization server trusted by your application. The user has to login, and usually accept the fact that the app can perform actions on the user’s behalf (think of Twitter’s “Allow/Deny” screen). If successful, the authorization server returns a code to the app which the app can then exchange for an access token containing the user’s username and potentially other claims.

Now remember what we started this post with? We want to get rid of part of the OAuth2 implementation. We don’t want to be bothered by too much of this. Let’s try to accomplish the following:

[![](/images/image_thumb_182.png)](/images/image_218.png)

Let’s introduce you to…

# WindowsAzure.Acs.Oauth2

“That looks like an assembly name. Heck, even like a NuGet package identifier!” You’re right about that. I’ve done a lot of the integration work for you ([sources](https://github.com/maartenba/WindowsAzure.Acs.Oauth2) / [NuGet package](https://nuget.org/packages/WindowsAzure.Acs.Oauth2/)).

*WindowsAzure.Acs.Oauth2* is currently in alpha status, so you’ll will have to register this package in your ASP.NET MVC Web API project using the package manager console, issuing the following command:

`Install-Package WindowsAzure.Acs.Oauth2 -IncludePrerelease

`

This command will bring some dependencies to your project and installs the following source files:

- *App_Start/AppStart_OAuth2API.cs* - Makes sure that OAuth2-signed SWT tokens are transformed into a *ClaimsIdentity* for use in your API. Remember where I used User.Identity.Name in my API? Populating that is performed by this guy.
- *Controllers/AuthorizeController.cs* - A standard authorization server implementation which is configured by the *Web.config* settings. You can override certain methods here, for example if you want to show additional application information on the consent page.
- *Views/Shared/_AuthorizationServer.cshtml* - A default consent page. This can be customized at will.

Next to these files, the following entries are added to your *Web.config* file:

 1 <?xml version="1.0" encoding="utf-8" ?>
 2 <configuration>
 3   <appSettings>
 4     <add key="WindowsAzure.OAuth.SwtSigningKey" value="[your 256-bit symmetric key configured in the ACS]" />
 5     <add key="WindowsAzure.OAuth.RelyingPartyName" value="[your relying party name configured in the ACS]" />
 6     <add key="WindowsAzure.OAuth.RelyingPartyRealm" value="[your relying party realm configured in the ACS]" />
 7     <add key="WindowsAzure.OAuth.ServiceNamespace" value="[your ACS service namespace]" />
 8     <add key="WindowsAzure.OAuth.ServiceNamespaceManagementUserName" value="ManagementClient" />
 9     <add key="WindowsAzure.OAuth.ServiceNamespaceManagementUserKey" value="[your ACS service management key]" />
10   </appSettings>
11 </configuration></pre>

These settings should be configured based on the Windows Azure Access Control settings. Details on this can be found [on the Github page](https://github.com/maartenba/WindowsAzure.Acs.Oauth2/blob/master/README.md#windows-azure-access-control-settings).

## Consuming the API

After populating Windows Azure Access Control Service with a client_id and client_secret for my consuming app (which you can do using the excellent [FluentACS](https://nuget.org/packages/FluentACS) package or manually, as shown in the following screenshot), you’re good to go.

[![](/images/image_thumb_183.png)](/images/image_219.png)

The *WindowsAzure.Acs.Oauth2* package adds additional functionality to your application: it provides your ASP.NET Web API with the current user’s details (after a successful OAuth2 authorization flow took place) and it adds a controller and view to your app which provides a simple consent page (that can be customized):

[![](/images/image_thumb_184.png)](/images/image_220.png)

After granting access, *WindowsAzure.Acs.Oauth2* will store the choice of the user in Windows Azure ACS and redirect you back to the application. From there on, the application can ask Windows Azure ACS for an access token and refresh the access token once it expires. Without your application having to interfere with that process ever again. *WindowsAzure.Acs.Oauth2 *transforms the incoming OAuth2 token into a *ClaimsIdentity* which your API can use to determine which user is accessing your API. Focus on your API, not on OAuth.

Enjoy!
