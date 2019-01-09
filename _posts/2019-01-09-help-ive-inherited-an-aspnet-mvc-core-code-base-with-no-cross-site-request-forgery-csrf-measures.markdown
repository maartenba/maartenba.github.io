---
layout: post
title: "Help, I've inherited an ASP.NET MVC Core code base with no Cross-Site Request Forgery (CSRF) measures!"
date: 2019-01-09 10:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "ASP.NET", "MVC", "Security"]
author: Maarten Balliauw
---

As ASP.NET MVC developers, whether ASP.NET MVC 5 or ASP.NET MVC Core, we all know it is important to perform certain validations to prevent a *Cross-Site Request Forgery (CSRF)* attack against the application we are building. The ASP.NET MVC provides the `@Html.AntiForgeryToken()` helper which we can use to add a hidden field in the form we are posting, and a `[ValidateAntiForgeryToken]` attribute which we can decorate our action method with and instructs the framework to validate the posted token is valid (or was forged).

Now... Imagine inheriting a code base that has *zero* of these measures implemented? How would you find which action methods need a `[ValidateAntiForgeryToken]`? In this post series, let's look at two approaches to find those. But first, let's rewind a bit - in case you have never heard about CSRF before.

In this series:

* [Help, I've inherited an ASP.NET MVC Core code base with no Cross-Site Request Forgery (CSRF) measures!](TODO)

## Wait, wait! What is this Cross-Site Request Forgery (CSRF) thing?

Let's look at the definition first:

> Cross-Site Request Forgery (CSRF) is an attack that forces an end user to execute unwanted actions on a web application in which they're currently authenticated. CSRF attacks specifically target state-changing requests, not theft of data, since the attacker has no way to see the response to the forged request. With a little help of social engineering (such as sending a link via email or chat), an attacker may trick the users of a web application into executing actions of the attacker's choosing. If the victim is a normal user, a successful CSRF attack can force the user to perform state changing requests like transferring funds, changing their email address, and so forth. If the victim is an administrative account, CSRF can compromise the entire web application.
>
> --- [*OWASP* on *Cross-Site Request Forgery (CSRF)*](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF))

There, now you know! But just in case that definition is not 100% clear, here's a quick example. Imagine you are a user of a banking application. You log in to the banking website, which typically sets a cookie so the website knows that you are you. Pretty much like any website out there.

Now what happens if I send you a link to a website that contains the following HTML code?

    <form id="hiddenForm" action="https://api.banking.example.com/v1/transfer" method="post">
        <input type="hidden" name="transfer_to_account" value="M44RT3N00123456789" />
        <input type="hidden" name="amount" value="500" />
        <input type="hidden" name="currency" value="EUR" />
    </form>
    <script type="text/javascript">
        document.getElementById('hiddenForm').submit();
    </script>

If you happen to be logged in to that banking website, this will make a call to `https://api.banking.example.com/v1/transfer`, posting a target account, amount and currency, along with your authentication cookie which your brower happily adds to the request.

Now, if our banking website does not do "CSRF validation" and accepts the post withour further ado, I will receive a nice sum of money. Thanks, banking website!

Let's assume we are the banking website. There is a straightforward way of catching this and refusing the form post, as it did not originate from the transfer form we have on our website!

> **Tip:** Read about the [synchronizer pattern](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)_Prevention_Cheat_Sheet#General_Recommendation:_Synchronizer_Token_Pattern) if you want to learn more about the ideas behind how a CSRF attack can be mitigated.

1) Store another cookie value, the *session token*, an unpredictable identifier that is tied to our current session on the banking website.
2) For every form we want to post, add a hidden field with a *field token* that contains some other token related to our user and *session token*.
3) When a form post comes in, validate the *session token* and *field token*, and verify they relate to one another as expected, and if not, refuse the form post.

If I would now trick you into using my hidden form above, the post will be denied because there is no way I could come up with a proper *session token* and *field token* that corresponds to how our banking site wants to see it. Unless many people use that form while the banking website is still vulnerable, so I get some sponsorship to purchase a quantum computer and break encryption.

In ASP.NET MVC, this can be done by:

1) Adding `@Html.AntiForgeryToken()` in our form, which will add a *field token* in our form
2) Experience framework magic which will add a *session token* cookie
3) When a for is posted, call `@AntiForgery.Validate()` in Razor or add the `[ValidateAntiForgeryToken]` attribute to the action method receivign the post, which will throw an exception if these do not match.
4) There is no 4.

Generally speaking, every action method that is callable from a URL (roughly speaking: `public` methods in a `Controller`) and is a `POST`, `PUT`, `PATCH`, `DELETE`, ... should do the above and validate the CSRF token.

> **Tip:** Search the Internet regarding to how to plug this into your Single-Page Angular/React/Vue/... application, there are various techniques to do so but they go beyond the scope of this blog post.

Intrigued? Here are a few resources that may be of interest:

* [Understand Antiforgery Token In ASP.NET MVC](https://www.c-sharpcorner.com/article/understand-antiforgeri-token-in-asp-net-mvc/), an article by Pradeep Yadav
* [Prevent Cross-Site Request Forgery (XSRF/CSRF) attacks in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/security/anti-request-forgery), a deep-dive article that also covers Angular and AJAX calls in general.
* Use your favorite search engine for queries like ["MVC anti forgery token"](https://duckduckgo.com/?q=mvc+anti+forgery+token&atb=v79-1__&ia=web) and the likes.

## What's next?

Funnily enough, I started writing this post without wanting to dive into the above introduction, but that happened and this blog post became a short series...

In the next post, we will look at the problem at hand: imagine inheriting a code base that has *zero* `[ValidateAntiForgeryToken]`. How can we find all action methods where this attribute should be added?

Stay tuned.