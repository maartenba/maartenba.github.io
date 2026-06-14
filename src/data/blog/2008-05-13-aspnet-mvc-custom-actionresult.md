---
layout: post
title: "ASP.NET MVC custom ActionResult (ImageResult)"
pubDatetime: 2008-05-13T19:03:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "MVC", "Personal", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/05/13/asp-net-mvc-custom-actionresult-imageresult.html
  - /post/2008/05/13/aspnet-mvc-custom-actionresult.html
---
The ASP.NET MVC framework introduces the concept of returning an *ActionResult* in *Controller*s since the "preview preview" [release on CodePlex](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640). The purpose of this concept is to return a generic *ActionResult* object for each *Controller* method, allowing different child classes returning different results.

An example ActionResult (built-in) is the *RenderViewResult*. Whenever you want to render a view, you can simply return an object of this class which will render a specific view in its *ExecuteResult* method. Another example is the *HttpRedirectResult* which will output an HTTP header (Location: /SomethingElse.aspx).

In my opinion, this is a great concept, because it allows you to develop ASP.NET MVC applications more transparently. In this blog post, I will build a custom *ActionResult* class which will render an image to the HTTP response stream.

[![](/images/WindowsLiveWriter/ASP.NETMVCcustomActionResultImageResult_D717/image_thumb_2.png)](/images/WindowsLiveWriter/ASP.NETMVCcustomActionResultImageResult_D717/image_6.png)As an example, let's create a page which displays the current time as an image.

One option for implementing this would be creating an ASP.NET HttpHandler which renders this image and can be used inline with a simple HTML tag: *![](DisplayTime.ashx)*

Wouldn't it be nice to be able to do something more ASP.NET MVC-like? Let's consider the following: *<%=Html.Image<HomeController>(c => c.DisplayTime(), 200, 50, "Current time")%>*

## 1. Creating the necessary HtmlHelper extension methods

The above example code is not available in standard ASP.NET MVC source code. We'll need an extension method for this, which will map a specific controller action, width, height and alternate text to a standard HTML image tag:

```csharp
public static class ImageResultHelper
{
    public static string Image<T>(this HtmlHelper helper, Expression<Action<T>> action, int width, int height)
        where T : Controller
    {
        return ImageResultHelper.Image<T>(helper, action, width, height, "");
    }
    public static string Image<T>(this HtmlHelper helper, Expression<Action<T>> action, int width, int height, string alt)
        where T : Controller
    {
        string url = helper.BuildUrlFromExpression<T>(action);
        return string.Format("<img src=\"{0}\" width=\"{1}\" height=\"{2}\" alt=\"{3}\" />", url, width, height, alt);
    }
}

```

## 2. The custom ActionResult class

Our new *ImageResult* class will inherit the abstract class *ActionResult* and implement its *ExecuteResult* method. This method basically performs communication over the HTTP response stream.

```csharp
public class ImageResult : ActionResult
{
    public ImageResult() { }
    public Image Image { get; set; }
    public ImageFormat ImageFormat { get; set; }
    public override void ExecuteResult(ControllerContext context)
    {
        // verify properties
        if (Image == null)
        {
            throw new ArgumentNullException("Image");
        }
        if (ImageFormat == null)
        {
            throw new ArgumentNullException("ImageFormat");
        }
        // output
        context.HttpContext.Response.Clear();
        if (ImageFormat.Equals(ImageFormat.Bmp)) context.HttpContext.Response.ContentType = "image/bmp";
        if (ImageFormat.Equals(ImageFormat.Gif)) context.HttpContext.Response.ContentType = "image/gif";
        if (ImageFormat.Equals(ImageFormat.Icon)) context.HttpContext.Response.ContentType = "image/vnd.microsoft.icon";
        if (ImageFormat.Equals(ImageFormat.Jpeg)) context.HttpContext.Response.ContentType = "image/jpeg";
        if (ImageFormat.Equals(ImageFormat.Png)) context.HttpContext.Response.ContentType = "image/png";
        if (ImageFormat.Equals(ImageFormat.Tiff)) context.HttpContext.Response.ContentType = "image/tiff";
        if (ImageFormat.Equals(ImageFormat.Wmf)) context.HttpContext.Response.ContentType = "image/wmf";
        Image.Save(context.HttpContext.Response.OutputStream, ImageFormat);
    }
}

```

## 3. A "DisplayTime" action on the HomeController

We'll add a *DisplayTime* action on the *HomeController* class, which will return an instance of the newly created class *ImageResult*:

```csharp
public ActionResult DisplayTime()
{
    Bitmap bmp = new Bitmap(200, 50);
    Graphics g = Graphics.FromImage(bmp);
    g.FillRectangle(Brushes.White, 0, 0, 200, 50);
    g.DrawString(DateTime.Now.ToShortTimeString(), new Font("Arial", 32), Brushes.Red, new PointF(0, 0));
    return new ImageResult { Image = bmp, ImageFormat = ImageFormat.Jpeg };
}

```

And just to be complete, here's the markup of the index view on the *HomeController*:

```csharp
<%@ Page Language="C#" MasterPageFile="~/Views/Shared/Site.Master" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="MvcApplication1.Views.Home.Index" %>
<%@ Import Namespace="MvcApplication1.Code" %>
<%@ Import Namespace="MvcApplication1.Controllers" %>
<asp:Content ID="indexContent" ContentPlaceHolderID="MainContent" runat="server">
    <p>
        <%=Html.Image<HomeController>(c => c.DisplayTime(), 200, 50, "Current time")%>
    </p>
</asp:Content>

```

Want the source code? [Download it here!](/files/MvcImageResult.zip) You can use it with the [current ASP.NET MVC framework source code drop](http://www.codeplex.com/aspnet/Release/ProjectReleases.aspx?ReleaseId=12640).
