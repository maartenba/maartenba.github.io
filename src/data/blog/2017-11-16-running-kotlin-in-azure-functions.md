---
layout: post
title: "Running Kotlin in Azure Functions"
pubDatetime: 2017-11-16T05:44:04Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Development", "Kotlin", "Azure", "Cloud"]
author: Maarten Balliauw
---

A while back, the Azure folks [announced support for Java on Azure Functions](https://azure.microsoft.com/en-us/blog/announcing-the-preview-of-java-support-for-azure-functions/). My immediate thought was: "Do they mean Java or JVM? And if they mean JVM, will it work with [Kotlin](https://kotlinlang.org/)?" In this blog post, we'll find out!

(and if you're a .NET developer, you'll learn a bit about that other platform: the JVM)

## What are Azure Functions?

[Azure Functions](https://azure.microsoft.com/en-us/services/functions/) are Microsoft Azure's event-driven, serverless compute experience. That's all the buzzwords, probably, but it boils down to not having to worry about virtual machines, sites, ...

The idea is we can just write a function, tell Azure we want to run it whenever an HTTP request comes in, a file is uploaded in a storage account, or when there is a full moon. Azure will execute it, no matter if it's just once or 500.000 times.

## Why try Azure Functions with Kotlin?

Over the past year, I was introduced to [Kotlin](https://kotlinlang.org/) at [JetBrains](https://www.jetbrains.com). Some of our internal tools run it, IDE's like [Rider](https://www.jetbrains.com/rider) are built using it and I've been writing some plugins for our [.NET IDE](https://www.jetbrains.com/rider) as well. One to [run XDT transforms](https://github.com/maartenba/rider-plugin-xdt), one to [manage .NET Core SDK versions](https://github.com/maartenba/rider-plugin-globaljson) and one that will provide C# Interactive support (but won't live as a plugin but will be in the product out of the box).

To me, the language is easy to get started with coming from C#, in fact it feels like it combined the best things from C# with some F#, Swing, TypeScript, ... - in short: it's enjoyable! Kotlin compiles to the JVM and provides Java interop. What I find very neat is that it provides a C# LINQ-like syntax but compiles it to good-old-and-fast low-level language constructs like `for` loops. In short: I'm starting to really really like this language!

Also loving Azure as a cloud platform, I felt like I had to marry these two. Turns out that marriage is quite easy if you know how to do it - which I did not but learned along the way. Here goes!

## Prerequisites

In this blog post, I will use [IntelliJ IDEA](https://www.jetbrains.com/idea/) as the IDE. Next to that one, we'll need JDK version 1.8 installed (and the `JAVA_HOME` environment variable set).

For the Azure Functions side, we'll need:

* [.NET Core](https://www.microsoft.com/net/core), latest version
* [Azure CLI](https://docs.microsoft.com/cli/azure)
* [Node.js](https://nodejs.org/download/), version 8.6 or higher
* [Azure Core Tools 2.0](https://www.npmjs.com/package/azure-functions-core-tools) - install them using npm: `npm install -g azure-functions-core-tools@core`

Ready? Then let's start!

## 1. Creating a new Azure Functions project in IntelliJ IDEA

The Azure folks have created a Maven Archetype which we can use. If you're familiar with .NET Core, a Maven Archetype is like a `dotnet new` template we can use to bootstrap a project. When creating a new project in IntelliJ IDEA, we can pick **Maven** as the project type, then *Create from archetype*, then pick (or add, first) the `com.microsoft.azure/azure-functions-archetype` archetype version 1.0:

![Create Azure Functions project from Maven Archetype using IntelliJ IDEA](/images/2017/11/intellij-idea-create-from-archetype.png)

Next, we'll have to specify a group id and artifact name (compared to .NET, these two are our NuGet package identifier - everything in Maven is a package so our project will be, too). I'll go with the Java-style group `be.maartenballiauw.azure`, then `ktfunction` as the artifact name.

Next, we must add two additional properties: `package` and `appName`. These will be used later on by the Azure Functions Maven plugin to deploy our app. For `package`, I'll go with `be.maartenballiauw.azure.ktfunction` and the `appName` will be whatever our target function app is called in the Azure portal.

![Maven project properties](/images/2017/11/maven-project-properties.png)

In the next step we can choose where on disk we want to save our project, then *Finish*  and let IntelliJ IDEA create the new Azure functions project for us.

One more thing: since we'll use Maven as the project system, IntelliJ IDEA will ask us to manually import the Maven project or auto-import it. Let's *Enable Auto-Import* here. 

![Auto-import Maven project](/images/2017/11/auto-import-maven.png)

*Note: if you prefer command-line for the above steps, check the [Azure Functions with Maven tutorial](https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-java-maven#generate-a-new-functions-project) Microsoft created.*

## 2. Enabling Kotlin in our project

We now have an Azure Functions project that uses Java. Let's enable Kotlin! This requires either a few manual steps fiddling in our [Maven `pom.xml` file](https://kotlinlang.org/docs/reference/using-maven.html), or a few clicks in the IDE. Let's go for the latter and use the **Tools \| Kotlin \| Configure Kotlin in Project...**  menu. A dialog will ask us to specify which modules we want to enable it in, let's just keep the defaults and make it happen.

![Configure Kotlin in project](/images/2017/11/configure-kotlin-in-project.png)

We're now ready to write some Kotlin!

## 3. Creating a first Kotlin Azure Function

If we look at the project structure, we already have two Java classes in our project:

* `src/main/java/be.maartenballiauw.azure.ktfunction/Function` - a simple "Hello World" added by the Azure Functions archetype
* `src/test/java/be.maartenballiauw.azure.ktfunction/Function` - a test for the above class

We can do two things now:

* Open both classes in the editor, press **Ctrl+Shift+Alt+K** to let IntelliJ IDEA convert these classes to Kotlin.
* Remove both classes and create our own from scratch.

While the first options is great and works mostly flawless to auto-convert Java to Kotlin, let's create a function from scratch. So drop the two classes, and then let's add a new class `HelloKotlin`:

```kotlin
package be.maartenballiauw.azure.ktfunction

class HelloKotlin {
}
```

Very clean code! Unfortunately, it does nothing yet. Let's code a function that takes a `String` input and returns another `String`. Some sort of "Hello World":

```kotlin
class HelloKotlin {
    fun hello(name: String): String {
        return "Hello $name"
    }
}
```

This function is public, takes a non-nullable string ([Kotlin dislikes `null`](https://kotlinlang.org/docs/reference/null-safety.html), if you do want to support `null` you could make it a `String?`).

One more thing to do: adding an `import` statement (the Java and Kotlin equivalent of .NET `using`), and some annotations (the Java and Kotlin equivalent of .NET attributes) that will help us generate the required Azure Functions metadata to make our project run. This is not required, but makes life easier.

* Adding `@FunctionName("hello")` on the function level will tell the Azure Functions Maven plugin this method will be exposed as a function.
* Adding `@HttpTrigger(name = "name", methods = arrayOf("get"), authLevel = AuthorizationLevel.ANONYMOUS)` on the `name` parameter will help the Azure Functions Maven plugin to determine this parameter is really called "name" and can be available on anonymous `GET` requests.

The full code:

```kotlin
package be.maartenballiauw.azure.ktfunction

import com.microsoft.azure.serverless.functions.annotation.*

class HelloKotlin {
    @FunctionName("hello")
    fun hello(
            @HttpTrigger(name = "name", methods = arrayOf("get"), authLevel = AuthorizationLevel.ANONYMOUS)
            name: String): String {
        return "Hello $name"
    }
}
```

We can now package our application (double-clicking the `package` Maven goal), then run it (double-clicking the `azure-functions \| azure-functions:run` Maven goal). Here's where to find them, if you want you can run the `package` goal right now but don't run it just yet:

![Azure Functions Maven targets](/images/2017/11/azure-functions-maven-targets.png)

## 4. Including runtime dependencies in our Azure Functions artifact

If we'd run the `package` target, we will find a `ktfunction-1.0-SNAPSHOT.jar` file of roughly 5 KB in our project folder on disk (under the `target` folder if you are curious). This contains our compiled Kotlin Azure Function, but it will not run. Not in the emulator. Not in the cloud.

We are missing one thing: our dependencies. When packaging our application, all we get is a package containing our own code, because the project system assumes dependencies can be found at runtime. That's not true, unfortunately. The Azure Functions cloud environment will not know about Kotlin. If you're using a database access library or a JSON serializer, the Azure Functions cloud environment will probably not know about it either. In short: we have to include all of our runtime dependencies in our package.

To add runtime dependencies to our deployment package, we can edit the `pom.xml` file. This is the project model Maven uses to do its thing. For .NET developers, it's a bit of a `.csproj` mixed with a bit of NuGet and some additional MSBuild.

Under the `<plugins>` element, we can add the following two plugins. Note these should be the first elements under the `<plugins>` element, at least before the Azure Functions plugins that are in our `pom.xml`.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-jar-plugin</artifactId>
    <version>2.6</version>
    <configuration>
        <archive>
            <manifest>
                <addClasspath>true</addClasspath>
            </manifest>
        </archive>
    </configuration>
</plugin>
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>2.6</version>
    <executions>
        <execution>
            <id>make-assembly</id>
            <phase>package</phase>
            <goals>
                <goal>single</goal>
            </goals>
            <configuration>
                <archive>
                    <manifest />
                </archive>
                <descriptorRefs>
                    <descriptorRef>jar-with-dependencies</descriptorRef>
                </descriptorRefs>
                <appendAssemblyId>false</appendAssemblyId>
            </configuration>
        </execution>
    </executions>
</plugin>
```

What does this do? Glad to hear you care!

* The [`maven-jar-plugin`](http://maven.apache.org/plugins/maven-jar-plugin/index.html) plugin builds a package based on what the `maven-assembly-plugin` provides us.
* The [`maven-assembly-plugin`](http://maven.apache.org/plugins/maven-assembly-plugin/index.html) plugin builds the necessary files to be able to create a self-contained package containing all of our runtime dependencies. Note the `appendAssemblyId` element has to be set to `false`, so that the resulting JAR file name is correct for the Azure Functions tools to pick up!

Ready? We can now double-click the `package` Maven goal to generate our deployment artifacts. If you see any failures, execute the `clean` Maven goal first - it could be there are some leftover files lingering from before we enabled Kotlin in our project.

Once finished, we can see the resulting files pop up in our project folder:

![Target folder contents](/images/2017/11/azure-functions-target-folder.png)

We can see a `.jar` file which contains our function code and dependencies. The size is now close to 1 MB (because of the dependencies being embedded). The `function.json` file(s) have been generated based on the annotations we added earlier in code.

Before running, make sure to edit the `local.settings.json` and add the required [Azure Storage settings](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#local-settings-file).

## 5. Running our Kotlin Azure Function

We're there. All set. Ready to roll! We can double-click the `azure-functions \| azure-functions:run` Maven goal and run our function in the emulator. 

![Run Kotlin Azure Function in emulator](/images/2017/11/run-azure-function-kotlin.png)

Note: I have been struggling with an *Object reference not set to an instance of an object*  error at startup. Some back-an-forth e-mails with the Azure team learned this error typically means the `JAVA_HOME` environment variable is not set. If you encounter this error, make sure to set it! Check the prerequisites again!

After startup, we can now invoke our Kotlin Azure Function. Either from the browser, hitting [http://localhost:7071/api/hello?name=Maarten](http://localhost:7071/api/hello?name=Maarten), or using IntelliJ IDEA's built-in REST client (**Tools \| Test RESTFul Webservice**):

![Test Kotlin Azure Function in IDE](/images/2017/11/test-restful-webservice.png)

The result value will be `Hello, Maarten!` or whatever we wrote in our Kotlin Azure Function.

## 6. Debugging our Kotlin Azure Function

Running our Kotlin Azure Function is one thing, we may also want to debug it. This is a little bit tricky, because of how the Azure Functions runtime works.

In short, when we run our Kotlin Azure Function, we are actually running a Maven target, which runs `dotnet.exe`, which in turn runs a Java worker process in which our function lives. That means three processes are involved:

1. JVM running `azure-functions:run` goal
2. `dotnet.exe` running Azure Functions runtime
3. JVM running our Kotlin Azure Function

Our IDE will start #1, while we really want to debug #3. Good thing for us is that the JVM process running our Kotlin Azure Function also exposes itself for debuggers to attach to it!

![JVM running our Kotlin Azure Function exposes debugger port](/images/2017/11/listening-jvm-kotlin-function.png)

This means that in IntelliJ IDEA, we can use the **Run \| Attach to Local Process...** menu, and pick our worker process:

![Attach debugger to Kotlin Azure Function](/images/2017/11/attach-debugger.png)

If we now place a breakpoint in our function and invoke our function, the debugger will pause our function and show us what is going on, allowing us to inspect variables, step through code, ...

![Debugging Kotlin on Azure](/images/2017/11/kotlin-azure-debugger.png)

## Conclusion

Running Kotlin in Azure Functions is quite easy. There's a bit of setup work to make the packaging work properly (but in reality, that happens a lot with any Maven-based project), but apart from that we can run Kotlin on Azure Functions - both the emulator as well as production.

Looking for the sample project? Here you go - [ktfunction.zip](/images/2017/11/ktfunction.zip) contains the full project I've used throughout this post.

Let me know if you try this, would love to see some Kotlin Azure Functions in production!
