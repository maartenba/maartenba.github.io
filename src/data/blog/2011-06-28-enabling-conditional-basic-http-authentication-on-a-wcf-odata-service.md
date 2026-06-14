---
layout: post
title: "Enabling conditional Basic HTTP authentication on a WCF OData service"
pubDatetime: 2011-06-28T12:24:12Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2011/06/28/enabling-conditional-basic-http-authentication-on-a-wcf-odata-service.html
---
[![](/images/image_thumb_91.png)](/images/image_121.png)Yes, a long title, but also something I was not able to find too easily using [Google](http://www.bing.com). Here’s the situation: for [MyGet](http://www.myget.org), we are implementing basic authentication to the OData feed serving available NuGet packages. If you recall my post [Using dynamic WCF service routes](/post/2011/05/09/Using-dynamic-WCF-service-routes.aspx), you may have deducted that MyGet uses that technique to have one WCF OData service serving the feeds of all our users. It’s just convenient! Unless you want basic HTTP authentication for some feeds and not for others…


After doing some research, I thought the easiest way to resolve this was to use WCF intercepting. Convenient, but how would you go about this? And moreover: how to make it extensible so we can use this for other WCF OData (or WebAPi) services in the future?


The solution to this was to create a message inspector (*IDispatchMessageInspector). *Here’s the implementation we created for MyGet: (**disclaimer**: this will only work for OData services and WebApi!)


 1 public class ConditionalBasicAuthenticationMessageInspector : IDispatchMessageInspector
 2 {
 3     protected IBasicAuthenticationCondition Condition { get; private set; }
 4     protected IBasicAuthenticationProvider Provider { get; private set; }
 5
 6     public ConditionalBasicAuthenticationMessageInspector(
 7         IBasicAuthenticationCondition condition, IBasicAuthenticationProvider provider)
 8     {
 9         Condition = condition;
10         Provider = provider;
11     }
12
13     public object AfterReceiveRequest(ref Message request, IClientChannel channel, InstanceContext instanceContext)
14     {
15         // Determine HttpContextBase
16         if (HttpContext.Current == null)
17         {
18             return null;
19         }
20         HttpContextBase httpContext = new HttpContextWrapper(HttpContext.Current);
21
22         // Is basic authentication required?
23         if (Condition.Evaluate(httpContext))
24         {
25             // Extract credentials
26             string[] credentials = ExtractCredentials(request);
27
28             // Are credentials present? If so, is the user authenticated?
29             if (credentials.Length > 0 && Provider.Authenticate(httpContext, credentials[0], credentials[1]))
30             {
31                 httpContext.User = new GenericPrincipal(
32                     new GenericIdentity(credentials[0]), new string[] { });
33                 return null;
34             }
35
36             // Require authentication
37             HttpContext.Current.Response.StatusCode = 401;
38             HttpContext.Current.Response.StatusDescription = "Unauthorized";
39             HttpContext.Current.Response.Headers.Add("WWW-Authenticate", string.Format("Basic realm=\"{0}\"", Provider.Realm));
40             HttpContext.Current.Response.End();
41         }
42
43         return null;
44     }
45
46     public void BeforeSendReply(ref Message reply, object correlationState)
47     {
48         // Noop
49     }
50
51     private string[] ExtractCredentials(Message requestMessage)
52     {
53         HttpRequestMessageProperty request = (HttpRequestMessageProperty)requestMessage.Properties[HttpRequestMessageProperty.Name];
54
55         string authHeader = request.Headers["Authorization"];
56
57         if (authHeader != null && authHeader.StartsWith("Basic"))
58         {
59             string encodedUserPass = authHeader.Substring(6).Trim();
60
61             Encoding encoding = Encoding.GetEncoding("iso-8859-1");
62             string userPass = encoding.GetString(Convert.FromBase64String(encodedUserPass));
63             int separator = userPass.IndexOf(':');
64
65             string[] credentials = new string[2];
66             credentials[0] = userPass.Substring(0, separator);
67             credentials[1] = userPass.Substring(separator + 1);
68
69             return credentials;
70         }
71
72         return new string[] { };
73     }
74 }</pre>

Our *ConditionalBasicAuthenticationMessageInspector* implements a WCF message inspector that, once a request has been received, checks the HTTP authentication headers to check for a basic username/password. One extra there: since we wanted conditional authentication, we have also implemented an *IBasicAuthenticationCondition *interface which we have to implement. This interface decides whether to invoke authentication or not. The authentication itself is done by calling into our *IBasicAuthenticationProvider*. Implementations of these can be found on our [CodePlex](http://myget.codeplex.com) site.

If you are getting optimistic: great! But how do you apply this message inspector to a WCF service? No worries: you can create a behavior for that. All you have to do is create a new *Attribute* and implement *IServiceBehavior*. In this implementation, you can register the *ConditionalBasicAuthenticationMessageInspector* on the service endpoint. Here’s the implementation:

 1 [AttributeUsage(AttributeTargets.Class)]
 2 public class ConditionalBasicAuthenticationInspectionBehaviorAttribute
 3     : Attribute, IServiceBehavior
 4 {
 5     protected IBasicAuthenticationCondition Condition { get; private set; }
 6     protected IBasicAuthenticationProvider Provider { get; private set; }
 7
 8     public ConditionalBasicAuthenticationInspectionBehaviorAttribute(
 9         IBasicAuthenticationCondition condition, IBasicAuthenticationProvider provider)
10     {
11         Condition = condition;
12         Provider = provider;
13     }
14
15     public ConditionalBasicAuthenticationInspectionBehaviorAttribute(
16         Type condition, Type provider)
17     {
18         Condition = Activator.CreateInstance(condition) as IBasicAuthenticationCondition;
19         Provider = Activator.CreateInstance(provider) as IBasicAuthenticationProvider;
20     }
21
22     public void AddBindingParameters(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase, Collection<ServiceEndpoint> endpoints, BindingParameterCollection bindingParameters)
23     {
24         // Noop
25     }
26
27     public void ApplyDispatchBehavior(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase)
28     {
29         foreach (ChannelDispatcher channelDispatcher in serviceHostBase.ChannelDispatchers)
30         {
31             foreach (EndpointDispatcher endpointDispatcher in channelDispatcher.Endpoints)
32             {
33                 endpointDispatcher.DispatchRuntime.MessageInspectors.Add(
34                     new ConditionalBasicAuthenticationMessageInspector(Condition, Provider));
35             }
36         }
37     }
38
39     public void Validate(ServiceDescription serviceDescription, ServiceHostBase serviceHostBase)
40     {
41         // Noop
42     }
43 }</pre>

One step to do: apply this service behavior to our OData service. Easy! Just add an attribute to the service class and you’re done! Note that we specify the *IBasicAuthenticationCondition* and *IBasicAuthenticationProvider* on the attribute.

1 [ConditionalBasicAuthenticationInspectionBehavior(
2     typeof(MyGetBasicAuthenticationCondition),
3     typeof(MyGetBasicAuthenticationProvider))]
4 public class PackageFeedHandler
5     : DataService<PackageEntities>,
6       IDataServiceStreamProvider,
7       IServiceProvider
8 {
9 }</pre>

Enjoy!
