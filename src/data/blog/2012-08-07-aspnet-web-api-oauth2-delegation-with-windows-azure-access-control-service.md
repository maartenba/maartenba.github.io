---
layout: post
title: "ASP.NET Web API OAuth2 delegation with Windows Azure Access Control Service"
pubDatetime: 2012-08-07T13:58:44Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Security", "Software"]
author: Maarten Balliauw
---
<p><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px 0px 5px 5px; padding-left: 0px; padding-right: 0px; display: inline; float: right; border-top: 0px; border-right: 0px; padding-top: 0px" title="OAuth 2 Windows Azure" border="0" alt="OAuth 2 Windows Azure" align="right" src="/images/image_216.png" width="136" height="136" />If you are familiar with OAuth2’s protocol flow, you know there’s a lot of things you should implement if you want to protect your ASP.NET Web API using OAuth2. To refresh your mind, here’s what’s required (at least):</p>  <ul>   <li>OAuth authorization server</li>    <li>Keep track of consuming applications</li>    <li>Keep track of user consent (yes, I allow application X to act on my behalf)</li>    <li>OAuth token expiration &amp; refresh token handling</li>    <li>Oh, and your API</li> </ul>  <p>That’s a lot to build there. Wouldn’t it be great to outsource part of that list to a third party? A little-known feature of the Windows Azure Access Control Service is that you can use it to keep track of applications, user consent and token expiration &amp; refresh token handling. That leaves you with implementing:</p>  <ul>   <li>OAuth authorization server</li>    <li>Your API</li> </ul>  <p>Let’s do it!</p>  <ul><!--EndFragment--></ul>  <p><em>On a side note: I’m aware of the </em><a href="http://hueniverse.com/2012/07/oauth-2-0-and-the-road-to-hell/" target="_blank"><em>road-to-hell post released last week</em></a><em> on OAuth2. I still think that whoever offers OAuth2 should be responsible enough to implement the protocol in a secure fashion. The protocol gives you the options to do so, and, as with regular web page logins, you as the implementer should think about security.</em></p>  <h2>Building a simple API</h2>  <p>I’ve been doing some demos lately using <a href="http://www.brewbuddy.net">www.brewbuddy.net</a>, a sample application (sources <a href="https://github.com/maartenba/BrewBuddy" target="_blank">here</a>) which enables hobby beer brewers to keep track of their recipes and current brews. There are a lot of applications out there that may benefit from being able to consume my recipes. I love the smell of a fresh API in the morning!</p>  <p>Here’s an API which would enable access to my BrewBuddy recipes:</p>  <div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:f9482a72-208f-4f41-b0c9-7773262b83c4" class="wlWriterEditableSmartContent"><pre style=" width: 723px; height: 287px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">[Authorize]
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;"></span><span style="color: #0000FF;">public</span><span style="color: #000000;"> </span><span style="color: #0000FF;">class</span><span style="color: #000000;"> RecipesController
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">    : ApiController
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">{
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">protected</span><span style="color: #000000;"> IRecipeService RecipeService { </span><span style="color: #0000FF;">get</span><span style="color: #000000;">; </span><span style="color: #0000FF;">private</span><span style="color: #000000;"> </span><span style="color: #0000FF;">set</span><span style="color: #000000;">; }
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> RecipesController(IRecipeService recipeService)
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    {
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">        RecipeService </span><span style="color: #000000;">=</span><span style="color: #000000;"> recipeService;
</span><span style="color: #008080;">10</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">11</span> <span style="color: #000000;">
</span><span style="color: #008080;">12</span> <span style="color: #000000;">    </span><span style="color: #0000FF;">public</span><span style="color: #000000;"> IQueryable</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">RecipeViewModel</span><span style="color: #000000;">&gt;</span><span style="color: #000000;"> Get()
</span><span style="color: #008080;">13</span> <span style="color: #000000;">    {
</span><span style="color: #008080;">14</span> <span style="color: #000000;">        var recipes </span><span style="color: #000000;">=</span><span style="color: #000000;"> RecipeService.GetRecipes(User.Identity.Name);
</span><span style="color: #008080;">15</span> <span style="color: #000000;">        var model </span><span style="color: #000000;">=</span><span style="color: #000000;"> AutoMapper.Mapper.Map(recipes, </span><span style="color: #0000FF;">new</span><span style="color: #000000;"> List</span><span style="color: #000000;">&lt;</span><span style="color: #000000;">RecipeViewModel</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">());
</span><span style="color: #008080;">16</span> <span style="color: #000000;">
</span><span style="color: #008080;">17</span> <span style="color: #000000;">        </span><span style="color: #0000FF;">return</span><span style="color: #000000;"> model.AsQueryable();
</span><span style="color: #008080;">18</span> <span style="color: #000000;">    }
</span><span style="color: #008080;">19</span> <span style="color: #000000;">}</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>Nothing special, right? We’re just querying our <em>RecipeService</em> for the current user’s recipes. And the current user should be logged in as specified using the<em> [Authorize]</em> attribute.&#160; Wait a minute! The current user?</p>

<p>I’ve built this API on the standard ASP.NET Web API features such as the <em>[Authorize]</em> attribute and the expectation that the <em>User.Identity.Name</em> property is populated. The reason for that is simple: my API requires a user and should not care how that user is populated. If someone wants to consume my API by authenticating over Forms authentication, fine by me. If someone configures IIS to use Windows authentication or even hacks in basic authentication, fine by me. My API shouldn’t care about that.</p>

<h2>OAuth2 is a different state of mind</h2>

<p>OAuth2 adds a layer of complexity. Mental complexity that is. Your API consumer is <em>not</em> your end user. Your API consumer is acting on behalf of your end user. That’s a huge difference! Here’s what really happens:</p>

<p><a href="/images/image_217.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="OAuth2 protocol flow" border="0" alt="OAuth2 protocol flow" src="/images/image_thumb_181.png" width="484" height="288" /></a></p>

<p>The end user loads a consuming application (a mobile app or a web app that doesn’t really matter). That application requests a token from an authorization server trusted by your application. The user has to login, and usually accept the fact that the app can perform actions on the user’s behalf (think of Twitter’s “Allow/Deny” screen). If successful, the authorization server returns a code to the app which the app can then exchange for an access token containing the user’s username and potentially other claims.</p>

<p>Now remember what we started this post with? We want to get rid of part of the OAuth2 implementation. We don’t want to be bothered by too much of this. Let’s try to accomplish the following:</p>

<p><a href="/images/image_218.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="OAuth2 protocol flow with Windows Azure" border="0" alt="OAuth2 protocol flow with Windows Azure" src="/images/image_thumb_182.png" width="484" height="250" /></a></p>

<p>Let’s introduce you to…</p>

<h1>WindowsAzure.Acs.Oauth2</h1>

<p>“That looks like an assembly name. Heck, even like a NuGet package identifier!” You’re right about that. I’ve done a lot of the integration work for you (<a href="https://github.com/maartenba/WindowsAzure.Acs.Oauth2" target="_blank">sources</a> / <a href="https://nuget.org/packages/WindowsAzure.Acs.Oauth2/" target="_blank">NuGet package</a>).</p>

<p><em>WindowsAzure.Acs.Oauth2</em> is currently in alpha status, so you’ll will have to register this package in your ASP.NET MVC Web API project using the package manager console, issuing the following command:</p>

<p><code>Install-Package WindowsAzure.Acs.Oauth2 -IncludePrerelease
    <br /></code></p>

<p>This command will bring some dependencies to your project and installs the following source files:</p>

<ul>
  <li>
    <p><em>App_Start/AppStart_OAuth2API.cs</em> - Makes sure that OAuth2-signed SWT tokens are transformed into a <em>ClaimsIdentity</em> for use in your API. Remember where I used User.Identity.Name in my API? Populating that is performed by this guy.</p>
  </li>

  <li>
    <p><em>Controllers/AuthorizeController.cs</em> - A standard authorization server implementation which is configured by the <em>Web.config</em> settings. You can override certain methods here, for example if you want to show additional application information on the consent page.</p>
  </li>

  <li>
    <p><em>Views/Shared/_AuthorizationServer.cshtml</em> - A default consent page. This can be customized at will.</p>
  </li>
</ul>

<p>Next to these files, the following entries are added to your <em>Web.config</em> file:</p>

<div style="padding-bottom: 0px; margin: 0px; padding-left: 0px; padding-right: 0px; display: inline; float: none; padding-top: 0px" id="scid:9D7513F9-C04C-4721-824A-2B34F0212519:bb7a745d-578c-436d-8071-c58229d20dd4" class="wlWriterEditableSmartContent"><pre style=" width: 723px; height: 193px;background-color:White;overflow: auto;"><div><!--

Code highlighting produced by Actipro CodeHighlighter (freeware)
http://www.CodeHighlighter.com/

--><span style="color: #008080;"> 1</span> <span style="color: #000000;">&lt;?</span><span style="color: #000000;">xml version</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">1.0</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> encoding</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">utf-8</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">?&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 2</span> <span style="color: #000000;"></span><span style="color: #000000;">&lt;</span><span style="color: #000000;">configuration</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 3</span> <span style="color: #000000;">  </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">appSettings</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 4</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">add key</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WindowsAzure.OAuth.SwtSigningKey</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">[your 256-bit symmetric key configured in the ACS]</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 5</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">add key</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WindowsAzure.OAuth.RelyingPartyName</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">[your relying party name configured in the ACS]</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 6</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">add key</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WindowsAzure.OAuth.RelyingPartyRealm</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">[your relying party realm configured in the ACS]</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 7</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">add key</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WindowsAzure.OAuth.ServiceNamespace</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">[your ACS service namespace]</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 8</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">add key</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WindowsAzure.OAuth.ServiceNamespaceManagementUserName</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">ManagementClient</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;"> 9</span> <span style="color: #000000;">    </span><span style="color: #000000;">&lt;</span><span style="color: #000000;">add key</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">WindowsAzure.OAuth.ServiceNamespaceManagementUserKey</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> value</span><span style="color: #000000;">=</span><span style="color: #800000;">&quot;</span><span style="color: #800000;">[your ACS service management key]</span><span style="color: #800000;">&quot;</span><span style="color: #000000;"> </span><span style="color: #000000;">/&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">10</span> <span style="color: #000000;">  </span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">appSettings</span><span style="color: #000000;">&gt;</span><span style="color: #000000;">
</span><span style="color: #008080;">11</span> <span style="color: #000000;"></span><span style="color: #000000;">&lt;/</span><span style="color: #000000;">configuration</span><span style="color: #000000;">&gt;</span></div></pre><!-- Code inserted with Steve Dunn's Windows Live Writer Code Formatter Plugin.  http://dunnhq.com --></div>

<p>These settings should be configured based on the Windows Azure Access Control settings. Details on this can be found <a href="https://github.com/maartenba/WindowsAzure.Acs.Oauth2/blob/master/README.md#windows-azure-access-control-settings" target="_blank">on the Github page</a>.</p>

<h2>Consuming the API</h2>

<p>After populating Windows Azure Access Control Service with a client_id and client_secret for my consuming app (which you can do using the excellent <a href="https://nuget.org/packages/FluentACS" target="_blank">FluentACS</a> package or manually, as shown in the following screenshot), you’re good to go.</p>

<p><a href="/images/image_219.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="ACS OAuth2 Service Identity" border="0" alt="ACS OAuth2 Service Identity" src="/images/image_thumb_183.png" width="484" height="262" /></a></p>

<p>The <em>WindowsAzure.Acs.Oauth2</em> package adds additional functionality to your application: it provides your ASP.NET Web API with the current user’s details (after a successful OAuth2 authorization flow took place) and it adds a controller and view to your app which provides a simple consent page (that can be customized):</p>

<p><a href="/images/image_220.png"><img style="background-image: none; border-bottom: 0px; border-left: 0px; margin: 5px auto; padding-left: 0px; padding-right: 0px; display: block; float: none; border-top: 0px; border-right: 0px; padding-top: 0px" title="image" border="0" alt="image" src="/images/image_thumb_184.png" width="484" height="362" /></a></p>

<p>After granting access, <em>WindowsAzure.Acs.Oauth2</em> will store the choice of the user in Windows Azure ACS and redirect you back to the application. From there on, the application can ask Windows Azure ACS for an access token and refresh the access token once it expires. Without your application having to interfere with that process ever again. <em>WindowsAzure.Acs.Oauth2 </em>transforms the incoming OAuth2 token into a <em>ClaimsIdentity</em> which your API can use to determine which user is accessing your API. Focus on your API, not on OAuth.</p>

<p>Enjoy!</p>

{% include imported_disclaimer.html %}

