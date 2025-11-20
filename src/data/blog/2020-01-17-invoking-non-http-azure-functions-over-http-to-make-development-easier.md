---
layout: post
title: "Invoking non-HTTP Azure Functions over HTTP to make development easier"
pubDatetime: 2020-01-17T03:44:05Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Web", ".NET", "dotnet", "Azure", "Functions"]
author: Maarten Balliauw
---

This week, I was presenting at [IglooConf](https://www.iglooconf.fi) ([Indexing and searching NuGet org with Azure Functions and Search](https://www.youtube.com/watch?v=ZxH133cyns8)). During one of the demos, I casually used a feature we shipped with the latest [Azure Toolkit for JetBrains Rider](https://plugins.jetbrains.com/plugin/11220-azure-toolkit-for-rider): when the Azure Functions host is running on a development machine, Rider lets us trigger functions from the gutter by generating an HTTP request for it.

![Trigger Azure Functions from Rider](/images/2020/01/trigger-azure-functions-from-rider.png)

Chatting with some attendees, not a lot of people are aware this is possible. During development, **Azure Functions can be triggered over HTTP, regardless of whether they are using an HTTP trigger or not.** For HTTP-triggered functions, there's of course an HTTP endpoint we can call, but the runtime also provides an endpoint for non-HTTP-triggered functions!

So instead of having to change the schedule expression on a `TimerTrigger` to see our function get invoked during development, we can invoke it over HTTP, on demand.

```
POST http://localhost:7071/admin/functions/{functionname}
Content-Type: application/json

{}
```

This works for most trigger bindings, and we can even provide data to our function. For example with a `QueueTrigger`, we can pass along the payload of the message it should process (as a string):

```
POST http://localhost:7071/admin/functions/ExampleQueue
Content-Type: application/json

{
    "input": "{ \"name\": \"Maarten\" }"
}
```

This will then trigger our function where we can process that payload:

![Invoke Azure Function with payload](/images/2020/01/azure-functions-invocation-from-rider-with-payload.png)

*Tip: When editing the HTTP fragment in Rider, use Alt+Enter and "edit JSON text fragment" to make escaping the JSON payload easier.

Having the ability to trigger functions that way makes the development flow much smoother! Check [the Azure docs](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#passing-test-data-to-a-function) for more background info.

Enjoy!
