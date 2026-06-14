---
layout: post
title: "Ordering fields in ASP.NET MVC 2 templated helpers"
pubDatetime: 2010-01-11T07:38:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/01/11/ordering-fields-in-asp-net-mvc-2-templated-helpers.html
  - /post/2010/01/11/ordering-fields-in-aspnet-mvc-2-templated-helpers.html
---
Ever worked with the templated helpers provided by ASP.NET MVC 2? Templated helpers provide a way to automatically build UI based on a data model that is marked with attributes defined in the* System.ComponentModel.DataAnnotations *namespace. For example, a property in the model can be decorated with the attribute* [DisplayFormat(DataFormatString = "{0:c}")]*, and the templated helpers will always render this field formatted as currency.

If you have worked with templated helpers, you must agree: they can be useful! There’s one thing which is impossible in the current version: ordering fields.

Take the following class and the rendered form using templated helpers:

[![](/images/image_thumb_15.png)](/images/image_38.png)

```csharp
public class Person
{
    public string Email { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

```

Nice, but I would rather have the field “Email” displayed third. It would be nice if the field order could be applied using the same approach as with the *System.ComponentModel.DataAnnotations* namespace: let’s build us an attribute for it!

## Building the OrderAttribute

Assuming you have already built an attribute once in your life, let’s go over this quickly:

```csharp
[global::System.AttributeUsage(AttributeTargets.Property, Inherited = true, AllowMultiple = false)]
public sealed class OrderAttribute : Attribute
{
    readonly int order;
    public OrderAttribute(int order)
    {
        this.order = order;
    }
    public int Order
    {
        get { return order; }
    }
}

```

The *OrderAttribute* can be applied to any property of a model, and needs exactly one parameter: *order*. This order will be used to sort the fields being rendered. Here’s how our *Person* class may look like after applying the *OrderAttribute*:

```csharp
public class Person
{
    [Order(3)]
    public string Email { get; set; }
    [Order(1)]
    public string FirstName { get; set; }
    [Order(2)]
    public string LastName { get; set; }
}

```

Speaks for itself, no? Now, before you stop reading: this will not work yet. The reason is that the default *ModelMetadataProvider* from the ASP.NET MVC framework, which provides the templated helpers all information they need about the model, does not know about this *OrderAttribute*. Let’s see what we can do about that…

## Building the OrderedDataAnnotationsModelMetadataProvider

In order for the ASP.NET MVC framework to know and use the *OrderAttribute* created previously, we’re going to extend the default *DataAnnotationsModelMetadataProvider* provided with ASP.NET MVC 2. Here’s the code:

```csharp
public class OrderedDataAnnotationsModelMetadataProvider : DataAnnotationsModelMetadataProvider
{
    public override IEnumerable<ModelMetadata> GetMetadataForProperties(
        object container, Type containerType)
    {
        SortedDictionary<int, ModelMetadata> returnValue =
            new SortedDictionary<int, ModelMetadata>();
        int key = 20000; // sort order for "unordered" keys
        IEnumerable<ModelMetadata> metadataForProperties =
            base.GetMetadataForProperties(container, containerType);
        foreach (ModelMetadata metadataForProperty in metadataForProperties)
        {
            PropertyInfo property = metadataForProperty.ContainerType.GetProperty(
                metadataForProperty.PropertyName);
            object[] propertyAttributes = property.GetCustomAttributes(
                typeof(OrderAttribute), true);
            if (propertyAttributes.Length > 0)
            {
                OrderAttribute orderAttribute = propertyAttributes[0] as OrderAttribute;
                returnValue.Add(orderAttribute.Order, metadataForProperty);
            }
            else
            {
                returnValue.Add(key++, metadataForProperty);
            }
        }
        return returnValue.Values.AsEnumerable();
    }
}

```

By overriding the *GetMetadataForProperties*, we’re hooking into the *DataAnnotationsModelMetadataProvider*’s moment of truth, the method where all properties of the model are returned as *ModelMetadata*. First of all, we’re using the ModelMetadata the base class provdes. Next, we use a little bit of reflection to get to the *OrderAttribute* (if specified) and use it to build a *SortedDictionary* of *ModelMetadata*. Easy!

One small caveat: non-decorated properties will always come last in the rendered output.

## One thing left…

One thing left: registering the *OrderedDataAnnotationsModelMetadataProvider* with the *ModelMetadataProviders* infrastructure offered by ASP.NET MVC. Here’s how:

```csharp
protected void Application_Start()
{
    AreaRegistration.RegisterAllAreas();
    RegisterRoutes(RouteTable.Routes);
    ModelMetadataProviders.Current = new OrderedDataAnnotationsModelMetadataProvider();
}

```

I guess you know this one goes into *Global.asax.cs*. If all works according to plan, your rendered view should now look like the following, with the e-mail field third:

[![](/images/image_thumb_16.png)](/images/image_39.png)
