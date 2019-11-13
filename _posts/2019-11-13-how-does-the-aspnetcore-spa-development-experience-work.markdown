---
layout: post
title: "How does the ASP.NET Core SPA development experience work with React, Angular and VueJS?"
date: 2019-11-13 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Web", ".NET", "SPA", "JavaScript"]
author: Maarten Balliauw
---

Many developers are building Single-Page Applications (SPAs) using popular frameworks like Angular, React or VueJS. They all come with an easy way to generate all required HTML, CSS, JavaScript and Webpack artifacts required to deploy to production, usually an NPM script like `npm run build` away. Having to build all those artifacts multiple times while developing on our local machine is not too pleasant, all of them come with a way to launch a development server that hot reloads artifacts when needed, usually another NPM script (such as `npm run start`) away.

Now switch to he .NET world. We can run our ASP.NET Core + React/Angular application on our development environment and get things like hot reload work automagically, and when we run an `msbuild /t:Publish`, all of the artifacts are built and generated for production, and added into our .NET deployment.

So when [Paul Everitt](https://twitter.com/paulweveritt) and myself were preparing for a webinar, [React+TypeScript+TDD in Rider](https://blog.jetbrains.com/dotnet/2019/10/10/webinar-reacttypescripttdd-rider/) (recording should be online soon), we were wondering how exactly the ASP.NET Core + React/Angular development experience is working under the hood after scaffolding a new application using the `dotnet new react`/`dotnet new angular` templates for .NET work.

## Project structure

Before we dive into how the development and release side of things work, let's first see what a typical solution and project looks like. I've created a new ASP.NET + React project in [Rider](https://www.jetbrains.com/rider), which uses `dotnet new react` under the hood.

<img src="../images/2019/11/aspnetcore-react-in-jetbrains-rider.png" width="360" alt="ASP.NET Core + React in JetBrains Rider" />

The project essentially contains two applications:

* Our SPA application, which lives under the `ClientApp` folder, including its `package.json`, `node_modules` and so on. In this case, a React app.

* Our server-side application, which is a regular ASP.NET Core application with its `Startup.cs` to bootstrap its behaviour.

## Development experience

What happens if we `F5` (Run) our application? Our ASP.NET Core will start and serve our SPA application. What's cool, though, is that whenever we make a change to the React app, things are hot-reloaded in the browser.

Change a template? Change some CSS? Change a model? All fine, there is no need to stop and restart the entire ASP.NET Core application: the client-side app will auto-reload whatever is needed and provides a very smooth workflow.

**How does it work?** Let's start with our `Startup.cs` and see what we can find in there.

Both `ConfigureServices` and the `Configure` methods are interesting, and each of them contributes to the development as well as the publishing experience.

Let's start with `ConfigureServices`. We will see a call to register "SPA static files" (`AddSpaStaticFiles()`), which is where we register the output path for our SPA. In other words: when publishing our app to production, where in the directory structure can all assets for our SPA be found.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllersWithViews();

    // In production, the React files will be served from this directory
    services.AddSpaStaticFiles(configuration => {
        configuration.RootPath = "ClientApp/build";
    });
}
```

More interesting for the development environment is `Configure`. Note I've removed a few things to keep it concise, use the ASP.NET + React/Angular templates on your machine if you want the full code!

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ...
    
    app.UseSpaStaticFiles();

    /// ...

    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "ClientApp";

        if (env.IsDevelopment())
        {
            spa.UseReactDevelopmentServer(npmScript: "start");
        }
    });
}
```

What's happening here?

* `UseSpaStaticFiles()` registers the middleware that will serve up the files from the path we just configured in `ConfigureServices`.
* `UseSpa()` registers the middleware that ensures our app is built. If you publish without there being any files in `ClientApp/build`, it will render a nice error message inforing us about that fact.

The most interesting thing here for the development experience is this:

```csharp
if (env.IsDevelopment())
{
    spa.UseReactDevelopmentServer(npmScript: "start");
}
```

When we are running in development, we are registering yet another middleware (by calling `UseReactDevelopmentServer()`) which will proxy NPM. The `npmScript: "start"` parameter should be a hint for that: the `ReactDevelopmentServerMiddleware` that is registered here will call `npm run start` and proxy it in our ASP.NET Core application.

This means that when using the ASP.NET Core + React/Angular templates, the development experience is essentially what you would get when running `npm run start` directly and working on the front-end. The only difference being that now our server-side API and client-side SPA will be served by our ASP.NET Core application.

Have a look at the [source code for `ReactDevelopmentServerMiddleware` on GitHub](https://github.com/aspnet/AspNetCore/blob/master/src/Middleware/SpaServices.Extensions/src/ReactDevelopmentServer/ReactDevelopmentServerMiddleware.cs). At [some point](https://github.com/aspnet/AspNetCore/blob/master/src/Middleware/SpaServices.Extensions/src/ReactDevelopmentServer/ReactDevelopmentServerMiddleware.cs#L65), it will run `npm run {npmScript}`, pass a few environment variables (for example to not launch the browser a second time), and proxy the process that has been started.

So when changing CSS/JavaScript/templates/..., it's not ASP.NET Core making everything work, it's the exact same `npm run start` doing this under the hood.

One more thing to note: the project file for our application contains some guard rails to make sure node and NPM are available on your system, and `npm install` has been run to fetch <strike>the entire Internet</strike> required dependencies. Go on, select the project in Rider and hit `F4` (Go to Source), and have a look.

Before build (`BeforeTargets="Build"`), we check whether we're in Debug mode and whether `node_modules` exists. If not, we try running `node --version` to see if node is installed, and then `npm install` to ensure all dependencies are there.

```xml
<Target Name="DebugEnsureNodeEnv"  
    BeforeTargets="Build"  
    Condition=" '$(Configuration)' == 'Debug' And !Exists('$(SpaRoot)node_modules') ">
    <!-- Ensure Node.js is installed -->
    <Exec Command="node --version" ContinueOnError="true">
        <Output TaskParameter="ExitCode" PropertyName="ErrorCode"/>
    </Exec>
    <Error Condition="'$(ErrorCode)' != '0'" Text="Node.js is required to build  
        and run this project. To continue, please install Node.js from https://nodejs.org/,  
        and then restart your command prompt or IDE."/>
    <Message Importance="high" Text="Restoring dependencies using 'npm'.  
        This may take several minutes..."/>
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm install"/>
</Target>
```

Pretty impressed by how simple(ish) yet clever this was done, kudos to the ASP.NET team!

## Publishing experience

As we have seen, during development, ASP.NET Core runs `npm run start` and proxies its development experience. This is definitely not something we would want in production!

Ideally when publishing our application, we want to run `npm run build` so that all artifacts required by our SPA are generated in `ClientApp/build`, then include that folder in our ASP.NET Core build output so it can be served by the middleware we registered using `UseSpaStaticFiles()` earlier.

As it turns out, this is *exactly* what happens! Again in our project file, an MSBuild target named `PublishRunWebpack` was added, which will, as part of running `msbuild /t:Publish`, do a couple of things for us:

* Run `npm install` to ensure dependencies are up-to-date
* Run `npm run build` to perform anything React needs to do in order to generate the static ouput for our SPA
* Add all files from the `ClientApp/build` folder into the ASP.NET Core application distribution.

Again, suprisingly simple(ish) and elegant!

The raw target from our project file:

```xml
<Target Name="PublishRunWebpack" AfterTargets="ComputeFilesToPublish">
    <!-- As part of publishing, ensure the JS resources are freshly built in production mode -->
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm install"/>
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm run build"/>

    <!-- Include the newly-built files in the publish output -->
    <ItemGroup>
        <DistFiles Include="$(SpaRoot)build\**"/>
        <ResolvedFileToPublish Include="@(DistFiles->'%(FullPath)')" Exclude="@(ResolvedFileToPublish)">
            <RelativePath>%(DistFiles.Identity)</RelativePath>
            <CopyToPublishDirectory>PreserveNewest</CopyToPublishDirectory>
            <ExcludeFromSingleFile>true</ExcludeFromSingleFile>
        </ResolvedFileToPublish>
    </ItemGroup>
</Target>
```

## What about other SPA's

You may have noticed this post only covered React. ASP.NET Core's emplates come with a similar setup for Angular, but none for VueJS or whatever other SPA framework you may be using.

Using the concepts described in this post, I hope you will be able to wire up VueJS or others as well. In fact, [here's a blog post by Douglas Cameron that describes how you could wire up VueJS](https://www.nyami.uk/posts/2019-05-10-VueWithAspNetPart1).

Till next time!