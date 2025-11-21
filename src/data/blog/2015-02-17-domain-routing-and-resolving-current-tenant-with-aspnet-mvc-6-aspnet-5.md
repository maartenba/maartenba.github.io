---
layout: post
title: "Domain Routing and resolving current tenant with ASP.NET MVC 6 / ASP.NET 5"
pubDatetime: 2015-02-17T10:53:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "ICT", "MVC", "Projects", "Software"]
author: Maarten Balliauw
---
<p>So you’re building a multi-tenant application. And just like many multi-tenant applications out there, the application will use a single (sub)domain per tenant and the application will use that to select the correct database connection, render the correct stylesheet and so on. Great! But how to do this with ASP.NET MVC 6?</p>
 <p>A few years back, I wrote about <a href="/post/2009/05/20/aspnet-mvc-domain-routing.aspx">ASP.NET MVC Domain Routing</a>. It seems that post was more popular than I thought, as people have been asking me how to do this with the new ASP.NET MVC 6. In this blog post, I’ll do exactly that, as well as provide an alternative way of resolving the current tenant based on the current request URL.</p>
 <p><strong>Disclaimer:</strong> ASP.NET MVC 6 still evolves, and a big chance exists that this blog post is outdated when you are reading it. I’ve used the following dependencies to develop this against:</p>
<script src="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec.js?file=project.json"></script>
 <p>You’re on your own if you are using other dependencies.</p>
 <h2>Domain routing – what do we want to do?</h2> <p>The premise for domain routing is simple. Ideally, we want to be able to register a route like this:</p>
<script src="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec.js?file=Usage%20-%20Route"></script>
 <p>The route would match any request that uses a hostname similar to <em>*.localtest.me</em>, where "*" is recognized as the current tenant and provided to controllers a a route value. And of course we can define the path route template as well, so we can recognize which controller and action to route into.</p>
 <h2>Domain routing – let’s do it!</h2> <p>Just like in my old post on <a href="/post/2009/05/20/aspnet-mvc-domain-routing.aspx">ASP.NET MVC Domain Routing</a>, we will be using the existing magic of ASP.NET routing and extend it a bit with what we need. In ASP.NET MVC 6, this means we’ll be creating a new <em>IRouter</em> implementation that encapsulates a <em>TemplateRoute</em>. Let’s call ours <em>DomainTemplateRoute</em>.</p>
 <p>The <em>DomainTemplateRoute</em> has a similar constructor to MVC’s <em>TemplateRoute</em>, with one exception which is that we also want a <em>domainTemplate</em> parameter in which we can define the template that the host name should match. We will create a new <em>TemplateRoute</em> that’s held in a private field, so we can easily match the request path against that if the domain matches. This means we only need some logic to match the incoming domain, something which we need a <em>TemplateMatcher</em> for. This guy will parse <em>{tenant}.localtest.me</em> into a dictionary that contains the actual value of the <em>tenant</em> placeholder. Not deal, as the <em>TemplateMatcher</em> usually does its thing on a path, but since it treats a dot (.) as a separator we should be good there.</p>
 <p>Having that infrastructure in place, we will need to build out the <em>Task RouteAsync(RouteContext context)</em> method that handles the routing. Simplified, it would look like this:</p>
<script src="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec.js?file=DomainTemplateRoute%20-%20RouteAsync"></script>
 <p>We match the hostname against our domain emplate. If it does not match, then the route does not match. If it does match, we call the inner <em>TemplateRoute</em>’s <em>RouteAsync</em> method and let that one handle the path template matching, constraints processing and so on. Lazy, but convenient!</p>
 <p>We’re not there yet. We also want to be able to build URLs using the various HtmlHelpers that are around. If we pass it route data that is only needed for the domain part of the route, we want to strip it off the virtual path context so we don’t end up with URLs like <em>/Home/About?tenant=tenant1</em> but instead with a normal <em>/Home/About</em>. Here’s a gist:</p>
<script src="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec.js?file=DomainTemplateRoute%20-%20GetVirtualPath"></script>
 <p>Fitting it all together, here’s the full <em>DomainTemplateRoute</em> class: <a title="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec#file-domaintemplateroute-cs" href="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec#file-domaintemplateroute-cs">https://gist.github.com/maartenba/77ca6f9cfef50efa96ec#file-domaintemplateroute-cs</a> – The helpers for registering these routes are at <a title="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec#file-domaintemplateroutebuilderextensions-cs" href="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec#file-domaintemplateroutebuilderextensions-cs">https://gist.github.com/maartenba/77ca6f9cfef50efa96ec#file-domaintemplateroutebuilderextensions-cs</a></p>
 <h2>But there’s another approach!</h2> <p>One might say the only reason we would want domain routing is to know the current tenant in a multi-tenant application. This will often be the case, and there’s probably a more convenient method of doing this: by building a middleware. Ideally in our application startup, we want to add <em>app.UseTenantResolver();</em> and that should ensure we always know the desired tenant for the current request. Let’s do this!</p>
 <p>OWIN learned us that we can simply create our own request pipeline and decide which steps the current request is routed through. So if we create such step, a middleware, that sets the current tenant on the current request context, we’re good. And that’s exactly what this middleware does:</p>
<script src="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec.js?file=TenantResolverMiddleware.cs"></script>
 <p>We check the current request, based on the request or one of its properties we create a Tenant instance and a TenantFeature instance and set it as a feature on the current HttpContext. And in our controllers we can now get the tenant by using that feature: <em>Context.GetFeature&lt;ITenantFeature&gt;()</em>.</p>
 <p>There you go, two ways of detecting tenants based on the incoming URL. The full source for both solutions is at <a title="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec" href="https://gist.github.com/maartenba/77ca6f9cfef50efa96ec">https://gist.github.com/maartenba/77ca6f9cfef50efa96ec</a> (requires some assembling).</p>




