---
layout: post
title: "How I push GoogleAnalyticsTracker to NuGet"
pubDatetime: 2012-11-21T08:25:30Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "General", "Projects", "Software", "Source control", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2012/11/21/how-i-push-googleanalyticstracker-to-nuget.html
---
If you check my blog post [Tracking API usage with Google Analytics](/post/2012/01/20/Tracking-API-usage-with-Google-Analytics.aspx), you’ll see that a small open-source component evolved from [MyGet](http://www.myget.org). This component, GoogleAnalyticsTracker, lives on [GitHub](https://github.com/maartenba/GoogleAnalyticsTracker) and [NuGet](http://nuget.org/packages/GoogleAnalyticsTracker) and has since evolved into something that supports Windows Phone and Windows RT as well. But let’s not focus on the open-source aspect.


It’s funny how things evolve. GoogleAnalyticsTracker started as a small component inside MyGet, and since a couple of weeks it uses MyGet to publish itself to NuGet. Say what? In this blog post, I’ll elaborate a bit on the development tools used on this tiny component.


## Source code


Source code for GoogleAnalyticsTracker can be found on [GitHub](https://github.com/maartenba/GoogleAnalyticsTracker). This is the main entry point to all activity around this “project”. If you have a nice addition, feel free to fork it and send me a pull request.


## Staging NuGet packages


Whenever I update the source code, I want to automatically build it and publish NuGet packages for it. Not directly to NuGet: I want to keep the regular version, the WinRT and WP version more or less in sync regarding version numbers. Also, I sometimes miss something which I fix again 5 minutes after. In the meanwhile, I like to have the generated package on some sort of “staging” feed, at MyGet. It’s even public, check [http://www.myget.org/F/githubmaarten](http://www.myget.org/F/githubmaarten) if you want to use my development artifacts.


When I decide it’s time for these packages to move to the “official NuGet package repository” at [NuGet.org](www.nuget.org), I simply click the “push” button in my MyGet feed. Yes, that’s a manual step but I wanted to have some “gate” in the middle where I should explicitly do something. Here’s what happens after clicking “push”:


[![](/images/image_thumb_191.png)](/images/image_227.png)


That’s right! You can use MyGet as a staging feed and from there push your packages onwards to any other feed out there. MyGet takes care of the uploading.


## Building the package


There’s one thing which I forgot… How do I build these packages? Well… I don’t. I let [MyGet Build Services](http://blog.myget.org/post/2012/10/15/MyGet-Build-Services-Public-Beta.aspx).do the heavy lifting. On your feed, you can simply click the “Add GitHub project” button and a list of all your GitHub repos will be shown:


[![](/images/image_thumb_192.png)](/images/image_228.png)


Tick a box and you’re ready to roll. And if you look carefully, you’ll see a “Build hook URL” being shown:


[![](/images/image_thumb_193.png)](/images/image_229.png)


Back on GitHub, there’s this concept of “service hooks”, basically small utilities that you can fire whenever a new commit occurs on your repository. Wouldn’t it be awesome to trigger package creation on MyGet whenever I check in code to GitHub? Guess what…


[![](/images/image_thumb_194.png)](/images/image_230.png)


That’s right! And MyGet even runs unit tests. Some sort of a continuous integration where I have the choice to promote packages to NuGet whenever I think they are stable.
