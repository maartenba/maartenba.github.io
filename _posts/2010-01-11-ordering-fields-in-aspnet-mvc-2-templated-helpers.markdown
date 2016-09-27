---
layout: post
title: "Ordering fields in ASP.NET MVC 2 templated helpers"
date: 2010-01-11 07:38:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
alias: ["/post/2010/01/11/Ordering-fields-in-ASPNET-MVC-2-templated-helpers.aspx", "/post/2010/01/11/ordering-fields-in-aspnet-mvc-2-templated-helpers.aspx"]
author: Maarten Balliauw
redirect_from:
 - /post/2010/01/11/Ordering-fields-in-ASPNET-MVC-2-templated-helpers.aspx.html
 - /post/2010/01/11/ordering-fields-in-aspnet-mvc-2-templated-helpers.aspx.html
---
<p>Ever worked with the templated helpers provided by ASP.NET MVC 2? Templated helpers provide a way to automatically build UI based on a data model that is marked with attributes defined in the<em> System.ComponentModel.DataAnnotations </em>namespace. For example, a property in the model can be decorated with the attribute<em> [DisplayFormat(DataFormatString = "{0:c}")]</em>, and the templated helpers will always render this field formatted as currency.</p>
<p>If you have worked with templated helpers, you must agree: they can be useful! There&rsquo;s one thing which is impossible in the current version: ordering fields.</p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/01/06/Ordering-fields-in-ASPNET-MVC-2-templated-helpers.aspx&amp;title=Ordering fields in ASP.NET MVC 2 templated helpers"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/01/06/Ordering-fields-in-ASPNET-MVC-2-templated-helpers.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
<p>Take the following class and the rendered form using templated helpers:</p>
<p><a href="/images/image_38.png"><img style="border-bottom: 0px; border-left: 0px; display: inline; margin-left: 0px; border-top: 0px; margin-right: 0px; border-right: 0px" title="ASP.NET MVC EditorForModel()" src="/images/image_thumb_15.png" border="0" alt="ASP.NET MVC EditorForModel()" width="265" height="212" align="right" /></a></p>
<p>[code:c#]</p>
<p>public class Person <br />{ <br />&nbsp;&nbsp;&nbsp; public string Email { get; set; } <br />&nbsp;&nbsp;&nbsp; public string FirstName { get; set; } <br />&nbsp;&nbsp;&nbsp; public string LastName { get; set; } <br />}</p>
<p>[/code]</p>
<p>Nice, but I would rather have the field &ldquo;Email&rdquo; displayed third. It would be nice if the field order could be applied using the same approach as with the <em>System.ComponentModel.DataAnnotations</em> namespace: let&rsquo;s build us an attribute for it!</p>
<h2>Building the OrderAttribute</h2>
<p>Assuming you have already built an attribute once in your life, let&rsquo;s go over this quickly:</p>
<p>[code:c#]</p>
<p>[global::System.AttributeUsage(AttributeTargets.Property, Inherited = true, AllowMultiple = false)] <br />public sealed class OrderAttribute : Attribute <br />{ <br />&nbsp;&nbsp;&nbsp; readonly int order;</p>
<p>&nbsp;&nbsp;&nbsp; public OrderAttribute(int order) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; this.order = order; <br />&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp; public int Order <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; get { return order; } <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>The <em>OrderAttribute</em> can be applied to any property of a model, and needs exactly one parameter: <em>order</em>. This order will be used to sort the fields being rendered. Here&rsquo;s how our <em>Person</em> class may look like after applying the <em>OrderAttribute</em>:</p>
<p>[code:c#]</p>
<p>public class Person <br />{ <br />&nbsp;&nbsp;&nbsp; [Order(3)] <br />&nbsp;&nbsp;&nbsp; public string Email { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Order(1)] <br />&nbsp;&nbsp;&nbsp; public string FirstName { get; set; }</p>
<p>&nbsp;&nbsp;&nbsp; [Order(2)] <br />&nbsp;&nbsp;&nbsp; public string LastName { get; set; } <br />}</p>
<p>[/code]</p>
<p>Speaks for itself, no? Now, before you stop reading: this will not work yet. The reason is that the default <em>ModelMetadataProvider</em> from the ASP.NET MVC framework, which provides the templated helpers all information they need about the model, does not know about this <em>OrderAttribute</em>. Let&rsquo;s see what we can do about that&hellip;</p>
<h2>Building the OrderedDataAnnotationsModelMetadataProvider</h2>
<p>In order for the ASP.NET MVC framework to know and use the <em>OrderAttribute</em> created previously, we&rsquo;re going to extend the default <em>DataAnnotationsModelMetadataProvider</em> provided with ASP.NET MVC 2. Here&rsquo;s the code:</p>
<p>[code:c#]</p>
<p>public class OrderedDataAnnotationsModelMetadataProvider : DataAnnotationsModelMetadataProvider <br />{ <br />&nbsp;&nbsp;&nbsp; public override IEnumerable&lt;ModelMetadata&gt; GetMetadataForProperties( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; object container, Type containerType) <br />&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SortedDictionary&lt;int, ModelMetadata&gt; returnValue = <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; new SortedDictionary&lt;int, ModelMetadata&gt;();</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; int key = 20000; // sort order for "unordered" keys</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; IEnumerable&lt;ModelMetadata&gt; metadataForProperties = <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; base.GetMetadataForProperties(container, containerType);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; foreach (ModelMetadata metadataForProperty in metadataForProperties) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PropertyInfo property = metadataForProperty.ContainerType.GetProperty( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; metadataForProperty.PropertyName);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; object[] propertyAttributes = property.GetCustomAttributes( <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; typeof(OrderAttribute), true);</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; if (propertyAttributes.Length &gt; 0) <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; OrderAttribute orderAttribute = propertyAttributes[0] as OrderAttribute; <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; returnValue.Add(orderAttribute.Order, metadataForProperty); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; else <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; { <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; returnValue.Add(key++, metadataForProperty); <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; } <br />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; }</p>
<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return returnValue.Values.AsEnumerable(); <br />&nbsp;&nbsp;&nbsp; } <br />}</p>
<p>[/code]</p>
<p>By overriding the <em>GetMetadataForProperties</em>, we&rsquo;re hooking into the <em>DataAnnotationsModelMetadataProvider</em>&rsquo;s moment of truth, the method where all properties of the model are returned as <em>ModelMetadata</em>. First of all, we&rsquo;re using the ModelMetadata the base class provdes. Next, we use a little bit of reflection to get to the <em>OrderAttribute</em> (if specified) and use it to build a <em>SortedDictionary</em> of <em>ModelMetadata</em>. Easy!</p>
<p>One small caveat: non-decorated properties will always come last in the rendered output.</p>
<h2>One thing left&hellip;</h2>
<p>One thing left: registering the <em>OrderedDataAnnotationsModelMetadataProvider</em> with the <em>ModelMetadataProviders</em> infrastructure offered by ASP.NET MVC. Here&rsquo;s how:</p>
<p>[code:c#]</p>
<p>protected void Application_Start() <br />{ <br />&nbsp;&nbsp;&nbsp; AreaRegistration.RegisterAllAreas();</p>
<p>&nbsp;&nbsp;&nbsp; RegisterRoutes(RouteTable.Routes);</p>
<p>&nbsp;&nbsp;&nbsp; ModelMetadataProviders.Current = new OrderedDataAnnotationsModelMetadataProvider(); <br />}</p>
<p>[/code]</p>
<p>I guess you know this one goes into <em>Global.asax.cs</em>. If all works according to plan, your rendered view should now look like the following, with the e-mail field third:</p>
<p><a href="/images/image_39.png"><img style="border-bottom: 0px; border-left: 0px; display: block; float: none; margin-left: auto; border-top: 0px; margin-right: auto; border-right: 0px" title="image" src="/images/image_thumb_16.png" border="0" alt="image" width="265" height="212" /></a></p>
<p><a href="http://www.dotnetkicks.com/kick/?url=/post/2010/01/06/Ordering-fields-in-ASPNET-MVC-2-templated-helpers.aspx&amp;title=Ordering fields in ASP.NET MVC 2 templated helpers"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2010/01/06/Ordering-fields-in-ASPNET-MVC-2-templated-helpers.aspx" border="0" alt="kick it on DotNetKicks.com" /> </a></p>
{% include imported_disclaimer.html %}
