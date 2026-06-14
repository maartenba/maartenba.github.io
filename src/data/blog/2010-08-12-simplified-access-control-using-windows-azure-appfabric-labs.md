---
layout: post
title: "Simplified access control using Windows Azure AppFabric Labs"
pubDatetime: 2010-08-12T15:05:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "CSharp", "General", "Security"]
author: Maarten Balliauw
redirect_from:
  - /post/2010/08/12/simplified-access-control-using-windows-azure-appfabric-labs.html
---
[![](/images/image_thumb_28.png)](/images/image_56.png)Earlier this week, [Zane Adam announced the availability of the New AppFabric Access Control service in LABS](http://blogs.msdn.com/b/zaneadam/archive/2010/08/05/new-access-control-service-in-labs-delivers-greatly-expanded-capabilities.aspx). The highlights for this release (and I quote):

- **Expanded Identity provider support** - allowing developers to build applications and services that accept both enterprise identities (through integration with Active Directory Federation Services 2.0), and a broad range of web identities (through support of Windows Live ID, Open ID, Google, Yahoo, Facebook identities) using a single code base.
- **WS-Trust and WS-Federation protocol support** – Interoperable WS-* support is important to many of our enterprise customers.
- **Full integration with Windows Identity Foundation (WIF)** - developers can apply the familiar WIF identity programming model and tooling for cloud applications and services.
- **A new management web portal** -  gives simple, complete control over all Access Control settings.

Wow! This just **has** to be good! Let’s see how easy it is to work with [claims based authentication](http://msdn.microsoft.com/en-us/magazine/ee335707.aspx) and the AppFabric Labs Access Control Service, which I’ll abbreviate to “ACS” throughout this post.

## What are you doing?

In essence, I’ll be “outsourcing” the access control part of my application to the ACS. When a user comes to the application, he will be asked to present certain “claims”, for example a claim that tells what the user’s role is. Of course, the application will only trust claims that have been signed by a trusted party, which in this case will be the ACS.

Fun thing is: my application only has to know about the ACS. As an administrator, I can then tell the ACS to trust claims provided by Windows Live ID or Google Accounts, which will be reflected to my application automatically: users will be able to authenticate through any service I configure in the ACS, without my application having to know. Very flexible, as I can tell the ACS to trust for example my company’s Active Directory and perhaps also the Active Directory of a customer who uses the application

## Prerequisites

Before you start, make sure you have the [latest version of Windows Identity Foundation](http://msdn.microsoft.com/en-us/evalcenter/dd440951.aspx) installed. This will make things easy, I promise! Other prerequisites, of course, are Visual Studio and an account on [https://portal.appfabriclabs.com](https://portal.appfabriclabs.com). Note that, since it’s still a “preview” version, this is free to use.

In the labs account, create a project and in that project create a service namespace. This is what you should be seeing (or at least: something similar):

[![](/images/AppFabric%20project_thumb.png)](/images/AppFabric%20project.png)

## Getting started: setting up the application side

Before starting, we will require a certificate for signing tokens and things like that. Let’s just start with creating one so we don’t have to worry about that further down the road. Issue the following command in a Visual Studio command prompt:

```bash
MakeCert.exe -r -pe -n "CN=<your service namespace>.accesscontrol.appfabriclabs.com" -sky exchange -ss my

```

This will create a certificate that is valid for your ACS project. It will be installed in the local certificate store on your computer. Make sure to [export both the public and private key](http://tinyurl.com/38zz8q9) (.cer and .pkx).

That being said and done: let’s add claims-based authentication to a new ASP.NET Website. Simply fire up Visual Studio, create a new ASP.NET application. I called it “MyExternalApp” but in fact the name is all up to you. Next, edit the Default.aspx page and paste in the following code:

```xml
<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.master" AutoEventWireup="true"
    CodeBehind="Default.aspx.cs" Inherits="MyExternalApp._Default" %>

<asp:Content ID="HeaderContent" runat="server" ContentPlaceHolderID="HeadContent">
</asp:Content>
<asp:Content ID="BodyContent" runat="server" ContentPlaceHolderID="MainContent">


Your claims:

    <asp:GridView ID="gridView" runat="server" AutoGenerateColumns="False">
        <Columns>
            <asp:BoundField DataField="ClaimType" HeaderText="ClaimType" ReadOnly="True" />
            <asp:BoundField DataField="Value" HeaderText="Value" ReadOnly="True" />
        </Columns>
    </asp:GridView>
</asp:Content>

```

Next, edit Default.aspx.cs and add the following *Page_Load* event handler:

```csharp
protected void Page_Load(object sender, EventArgs e)
{
    IClaimsIdentity claimsIdentity =
        ((IClaimsPrincipal)(Thread.CurrentPrincipal)).Identities.FirstOrDefault();

    if (claimsIdentity != null)
    {
        gridView.DataSource = claimsIdentity.Claims;
        gridView.DataBind();
    }
}

```

So far, so good. If we had everything configured, Default.aspx would simply show us the claims we received from ACS once we have everything running. Now in order to configure the application to use the ACS, there’s two steps left to do:

- Add a reference to *Microsoft.IdentityModel* (located somewhere at* C:\Program Files\Reference Assemblies\Microsoft\Windows Identity Foundation\v3.5\Microsoft.IdentityModel.dll*)
- Add an STS reference…

That first step should be easy: add a reference to *Microsoft.IdentityModel* in your ASP.NET application. The second step is almost equally easy: right-click the project and select “Add STS reference…”, like so:

[![](/images/Add%20STS%20reference_thumb.png)](/images/Add%20STS%20reference.png)

A wizard will pop-up. Here’s a secret: this wizard will do a lot for us! On the first screen, enter the full URL to your application. I have mine hosted on IIS and enabled SSL, hence the following screenshot:

[![](/images/Specify%20application%20URI_thumb.png)](/images/Specify%20application%20URI.png)

In the next step, enter the URL to the STS federation metadata. To the what where? Well, to the metadata provided by ACS. This metadata contains the types of claims offered, the certificates used for signing, … The URL to enter will be something like [https://<your service namespace>.accesscontrol.appfabriclabs.com:443/FederationMetadata/2007-06/FederationMetadata.xml](https://<your service namespace>.accesscontrol.appfabriclabs.com:443/FederationMetadata/2007-06/FederationMetadata.xml)**:

[![](/images/Security%20Token%20Service_thumb.png)](/images/Security%20Token%20Service.png)

In the next step, select “Disable security chain validation”. Because we are using self-signed certificates, selecting the second option would lead us to doom because all infrastructure would require a certificate provided by a valid certificate authority.

From now on, it’s just “Next”, “Next”, “Finish”. If you now have a look at your *Web.config* file, you’ll see that the wizard has configured the application to use ACS as the federation authentication provider. Furthermore, a new folder called “FederationMetadata” has been created, which contains an XML file that specifies which claims this application requires. Oh, and some other details on the application, but nothing to worry about at this point.

Our application has now been configured: off to the ACS side!

## Getting started: setting up the ACS side

First of all, we need to register our application with the Windows Azure AppFabric ACS. his can be done by clicking “Manage” on the management portal over at [https://portal.appfabriclabs.com](https://portal.appfabriclabs.com). Next, click “Relying Party Applications” and “Add Relying Party Application”. The following screen will be presented:

[![](/images/Add%20Relying%20Party%20Application_thumb.png)](/images/Add%20Relying%20Party%20Application.png)

Fill out the form as follows:

- Name: a descriptive name for your application.
- Realm: the URI that the issued token will be valid for. This can be a complete domain (i.e. [www.example.com](http://www.example.com)) or the full path to your application. For now, enter the full URL to your application, which will be something like [https://localhost/MyApp](https://localhost/MyApp).
- Return URL: where to return after successful sign-in
- Token format: we’ll be using the defaults in WIF, so go for SAML 2.0.
- For the token encryption certificate, select X.509 certificate and upload the certificate file (.cer) we’ve been using before
- Rule groups: pick one, best is to create a new one specific to the application we are registering

Afterwards click “Save”. Your application is now registered with ACS.

The next step is to select the Identity Providers we want to use. I selected Windows Live ID and Google Accounts as shown in the next screenshot:

[![](/images/Identity%20Providers_thumb.png)](/images/Identity%20Providers.png)

One thing left: since we are using Windows Identity Foundation, we have to upload a token signing certificate to the portal. Export the private key of the previously created certificate and upload that to the “Certificates and Keys” part of the management portal. Make sure to specify that the certificate is to be used for token signing.

[![](/images/Signing%20certificate%20Windows%20Identity%20Foundation%20WIF_thumb.png)](/images/Signing%20certificate%20Windows%20Identity%20Foundation%20WIF.png)

Allright, we’re almost done. Well, in fact: we are done! An optional next step would be to edit the rule group we’ve created before. This rule group will describe the claims that will be presented to the application asking for the user’s claims. Which is very powerful, because it also supports so-called claim transformations: if an identity provider provides ACS with a claim that says “the user is part of a group named Administrators”, the rules can then transform the claim into a new claim stating “the user has administrative rights”.

## Testing our setup

With all this information and configuration in place, press* F5* inside Visual Studio and behold… Your application now redirects to the STS in the form of ACS’ login page.

[![](/images/Sign%20in%20using%20AppFabric_thumb.png)](/images/Sign%20in%20using%20AppFabric.png)

So far so good. Now sign in using one of the identity providers listed. After a successful sign-in, you will be redirected back to ACS, which will in turn redirect you back to your application. And then: misery :-)

[![](/images/Request%20validation_thumb.png)](/images/Request%20validation.png)

ASP.NET request validation kicked in since it detected unusual headers. Let’s fix that. Two possible approaches:

- Disable request validation, but I’d prefer not to do that
- Create a custom *RequestValidator*

Let’s go with the latter option… Here’s a class that you can copy-paste in your application:

```

public class WifRequestValidator : RequestValidator
{
    protected override bool IsValidRequestString(HttpContext context, string value, RequestValidationSource requestValidationSource, string collectionKey, out int validationFailureIndex)
    {
        validationFailureIndex = 0;

        if (requestValidationSource == RequestValidationSource.Form && collectionKey.Equals(WSFederationConstants.Parameters.Result, StringComparison.Ordinal))
        {
            SignInResponseMessage message = WSFederationMessage.CreateFromFormPost(context.Request) as SignInResponseMessage;

            if (message != null)
            {
                return true;
            }
        }

        return base.IsValidRequestString(context, value, requestValidationSource, collectionKey, out validationFailureIndex);
    }
}

```

Basically, it’s just validating the request and returning true to ASP.NET request validation if a *SignInMesage* is in the request. One thing left to do: register this provider with ASP.NET. Add the following line of code in the *<system.web>* section of *Web.config*:

```

<httpRuntime requestValidationType="MyExternalApp.Modules.WifRequestValidator" />

```

If you now try loading the application again, chances are you will actually see claims provided by ACS:

[![](/images/Claims%20output%20from%20Windows%20Azure%20AppFabric%20Access%20Control%20Service_thumb.png)](/images/Claims%20output%20from%20Windows%20Azure%20AppFabric%20Access%20Control%20Service.png)

There', that’s it. We now have successfully delegated access control to ACS. Obviously the next step would be to specify which claims are required for specific actions in your application, provide the necessary claims transformations in ACS, … All of that can easily be found on [Google](http://www.google.com) [Bing](http://www.bing.com).

## Conclusion

To be honest: I’ve always found claims-based authentication and Windows Azure AppFabric Access Control a good match in theory, but an ugly and cumbersome beast to work with. With this labs release, things get interesting and almost self-explaining, allowing for easier implementation of it in your own application. As an extra bonus to this blog post, I also decided to link my ADFS server to ACS: it took me literally 5 minutes to do so and works like a charm!

Final conclusion: AppFabric team, please ship this soon :-) I really like the way this labs release works and I think many users who find the step up to using ACS today may as well take the step if they can use ACS in the easy manner the labs release provides.

By the way: more information can be found on [http://acs.codeplex.com](http://acs.codeplex.com).
