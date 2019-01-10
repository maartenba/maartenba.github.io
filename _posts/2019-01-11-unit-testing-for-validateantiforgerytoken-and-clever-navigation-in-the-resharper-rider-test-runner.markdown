---
layout: post
title: "Unit testing for ValidateAntiForgeryToken and clever navigation in the ReSharper/Rider test runner"
date: 2019-01-11 04:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "ASP.NET", "MVC", "Security"]
author: Maarten Balliauw
---

We all know it's important to prevent *Cross-Site Request Forgery (CSRF)* attacks against our application. Unfortunately, our inherited code base has *zero* measures implemented - not one action methods with a `[ValidateAntiForgeryToken]` attribute in sight!

In the [previous post](https://blog.maartenballiauw.be/post/2019/01/10/tracking-down-action-methods-that-need-validateantiforgerytoken-using-structural-search-and-replace.html), we looked at using [Structural Search and Replace in ReSharper](https://www.jetbrains.com/help/resharper/Navigation_and_Search__Structural_Search_and_Replace.html) to find all action methods in our inherited code base. That proved powerful, but there are so many edge cases to cover that it's not ideal to check our current code base, and also difficult to keep checking for this. We need a unit test to ensure `[ValidateAntiForgeryToken]` attributes are present!

Today, we will look at implementin a unit test that ensures all action methods that need `[ValidateAntiForgeryToken]` have it added. As a bonus, I'll use a clever trick to make navigation from the test runner to our action method much easier!

In this series:

* [Help, I've inherited an ASP.NET MVC Core code base with no Cross-Site Request Forgery (CSRF) measures!](https://blog.maartenballiauw.be/post/2019/01/09/help-ive-inherited-an-aspnet-mvc-core-code-base-with-no-cross-site-request-forgery-csrf-measures.html)
* [Tracking down action methods that need ValidateAntiForgeryToken using Structural Search and Replace](https://blog.maartenballiauw.be/post/2019/01/10/tracking-down-action-methods-that-need-validateantiforgerytoken-using-structural-search-and-replace.html)
* [Unit testing for ValidateAntiForgeryToken and clever navigation in the ReSharper/Rider test runner](TODO)

## What's the plan? Which action methods are we after?

In the [previous post](https://blog.maartenballiauw.be/post/2019/01/10/tracking-down-action-methods-that-need-validateantiforgerytoken-using-structural-search-and-replace.html), we decided we wanted to search for action methods, add the `[ValidateAntiForgeryToken]` attribute, then navigate to the related view, find the form in there, and add `@Html.AntiForgeryToken()`.

Great! We also defined our action methods are:

* in a class that extends `Controller`/`ControllerBase`/`IController`
* is a `public` method (as that's what ASP.NET MVC exposes over HTTP)
* have a `[HttpPost]` attribute (or `[HttpDelete]`, or `[AcceptVerbs()]`, or ...)

Sound like a job for... Reflection!

## Finding action methods using reflection

We will cover writing our unit test later, for now, let's focus on finding action methods using reflection. And while I **could** write up paragraphs of text and build up the code, I'll just go with code that has lots of comments:

```csharp
// No ValidateAntiForgeryTokenAttribute needed for these HTTP methods:
var httpMethodExceptions = new[] { "GET", "HEAD" };

// We will search for controllers in this assembly:
var assembly = Assembly.GetAssembly(typeof(HomeController));

// Find those action methods!
var actionMethodsThatRequireValidateAntiForgeryTokenAttribute = assembly.GetTypes()
    // Get all types that extend Controller:
    .Where(t => typeof(Controller).IsAssignableFrom(t))

    // Get all public methods on these types:
    .SelectMany(t => t.GetMethods(BindingFlags.Instance | BindingFlags.DeclaredOnly | BindingFlags.Public))

    // Filter out anything compiler-generated:
    .Where(m => !m.GetCustomAttributes(typeof(CompilerGeneratedAttribute), true).Any())

    // Filter out methods that *only* support verbs from our httpMethodExceptions above.
    // If they *only* support e.g. a GET, that's fine.
    .Where(m =>
    {
        var attributes = m.GetCustomAttributes()
            .Where(a => a is HttpMethodAttribute || a is AcceptVerbsAttribute)
            .ToArray();
        
        return attributes.Length == 0 || !(attributes
            .All(attribute =>
            {
                if (attribute is HttpMethodAttribute httpMethodAttribute)
                {
                    return httpMethodAttribute.HttpMethods.All(v =>
                        httpMethodExceptions.Any(ve => v.Equals(ve.ToString(),
                            StringComparison.InvariantCultureIgnoreCase)));
                }
                else if (attribute is AcceptVerbsAttribute acceptVerbsAttribute)
                {
                    return acceptVerbsAttribute.HttpMethods.All(v =>
                        httpMethodExceptions.Any(ve => v.Equals(ve.ToString(),
                            StringComparison.InvariantCultureIgnoreCase)));
                }

                return false;
            }));
    })

    // Order them by namespace, controller, method:
    .OrderBy(m => m.DeclaringType.FullName)
    .ThenBy(m => m.Name);
```

> **Tip:** Further in our unit test, we will use the data from this in an xUnit.net unit test. If you try this at home, you will need another `.Select(m => new object[] { m.DeclaringType.FullName, m });` at the end of the above LINQ statement to get the proper format out of it.

Summarized:

* Find all types that extend `Controller`;
* Find their `public` methods that are *not compiler generated*;
* Filter out methods that explicitly state they only support `GET` and/or `HEAD`;
* Order them by namespace, controller, method.

This can probably be refined a bit by adding more than just one assembly (if that's what your solution contains), and probably we also want to add a list of action methods that should not be checked because there are always exceptions to the rule.

## Unit testing for `ValidateAntiForgeryTokenAttribute`

Our test will be written using [xUnit.net](https://xunit.github.io/). We can use it to [create parameterized tests](https://andrewlock.net/creating-parameterised-tests-in-xunit-with-inlinedata-classdata-and-memberdata/), where one test is executed for each piece of data we pass it.

This would be our test:

```csharp
[Theory]
[MemberData(nameof(GetControllerActionMethodsThatRequireValidateAntiForgeryTokenAttribute))]
public void AllActionsHaveAntiForgeryTokenIfNotGet(string controller, MemberInfo actionMethod)
{
    // Act
    var hasAntiForgeryToken = actionMethod.GetCustomAttributes()
        .Any(a => a is ValidateAntiForgeryTokenAttribute);

    // Assert
    Assert.True(hasAntiForgeryToken);
}
```

This test, or theory, will be executed for each element returned by the `GetControllerActionMethodsThatRequireValidateAntiForgeryTokenAttribute` method (woohoo, I named a method longer than the name of the village [Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch](http://www.llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch.co.uk/say.php)!).

That long-named method is the code we wrote earlier and searched for action methods that should have a `[ValidateAntiForgeryToken]` slapped on them. Our test then checks if that is the case, and succeeds if it is.

If we run that test, we will probably see a lot of failed tests. What's nice is that, when using the [ReSharper test runner](https://www.jetbrains.com/resharper), we can see the parameters passed into our test and then find the controller/action that we need to correct.

![Failing tests tell us where we need a `[ValidateAntiForgeryToken]`](/images/2019/01/test-results-failed.png)

All that's left is fix these occurrences, and we are done!

## Bonus: a clever trick to make navigation from the test runner to our action method much easier

If you are using the [ReSharper test runner](https://www.jetbrains.com/resharper), we can make our test a bit more developer friendly. Right now, we have to read the test name in the tree to see which action method needs a `[ValidateAntiForgeryToken]`. You may have noticed that the test runner has an output log as well, and that test contains the path to our unit test class which we can **Ctrl+Click** to navigate to it.

What if there was a clever trick to make navigation from the test runner to our action method much easier? Turns out there is!

When a test fails due to an `Exception` being thrown, ReSharper (and [Rider](https://www.jetbrains.com/rider), too), will print the stack trace of it in the test output, including navigation to any classes/methods that are recognized in the stack trace.

So.. what if we throw an `Exception` with a custom stack trace? Something like this one:

```csharp
private class MissingValidateAntiForgeryTokenAttributeException : XunitException
{
    public MissingValidateAntiForgeryTokenAttributeException(string controller, MemberInfo actionMethod)
        : base($"The action method \"{actionMethod.Name}\" misses a [ValidateAntiForgeryToken] attribute!\r\n"
               + "\r\n"
               + "Add the [ValidateAntiForgeryToken] or make the method accept only HTTP GET or HEAD using the [HttpGet]/[HttpHead] attribute.\r\n",

            $"at {controller}.{actionMethod.Name}() in {actionMethod.DeclaringType.Name}:line 0")
    {
    }
}
```

The message does not really matter, the stack trace does. If it is formatted like to ```$"at {controller}.{actionMethod.Name}() in {actionMethod.DeclaringType.Name}:line 0"``` (the line number does not matter), ReSharper's test runner gives us **Ctrl+Click**-ability to quickly navigate to the correct action method and fix things.

> **Note:** We could also include the full type name and method name in the message to get navigation.

All we need is to update our unit test to throw this `MissingValidateAntiForgeryTokenAttributeException`:

```csharp
[Theory]
[MemberData(nameof(GetControllerActionMethodsThatRequireValidateAntiForgeryTokenAttribute))]
public void AllActionsHaveAntiForgeryTokenIfNotGet(string controller, MemberInfo actionMethod)
{
    // Act
    var hasAntiForgeryToken = actionMethod.GetCustomAttributes()
        .Any(a => a is ValidateAntiForgeryTokenAttribute);

    // Assert
    if (!hasAntiForgeryToken)
    {
        throw new MissingValidateAntiForgeryTokenAttributeException(controller, actionMethod);
    }
    Assert.True(hasAntiForgeryToken);
}
```

When we now run our test using the ReSharper or Rider test runner, we get easy navigation for free!

![A clever trick to make navigation from the test runner to our action method much easier](/images/2019/01/resharper-tricking-test-runner-navigation.png)

From here, we can add the `[ValidateAntiForgeryToken]` attribute, then navigate to the related view, find the form in there, and add `@Html.AntiForgeryToken()`.

## Conclusion

We now tackled our issue. We inherited a code base that had *zero* of ASP.NET MVC's CSRF protection implemented, and wrote a unit test that helps us find action methods where `[ValidateAntiForgeryToken]` is missing.

By using a clever trick to make navigation from the test runner to our action method easier, we can run our test, find missing `[ValidateAntiForgeryToken]` attributes, and go fix them.

By making this a unit test, we also made sure our future self and team members properly keep adding those `[ValidateAntiForgeryToken]` attributes - if not, our tests will catch it!

Enjoy!
