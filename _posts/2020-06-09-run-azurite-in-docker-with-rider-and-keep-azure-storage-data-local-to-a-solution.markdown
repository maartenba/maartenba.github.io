---
layout: post
title: "Run Azurite in Docker with Rider and keep Azure Storage data local to a solution"
date: 2020-06-08 03:44:05 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", ".NET", "Azure", "Rider"]
author: Maarten Balliauw
---

In this blog post, we'll see how we can use [Azurite](https://github.com/Azure/Azurite), an open source Azure Storage API compatible server (emulator), in Docker, and how to run it from [JetBrains Rider](https://jetbrains.com/rider/). We can use Azurite in Docker to keep Azure Storage data local to a solution, and, for example, have different blobs and queues for different Azure Functions projects.

## Why use Azurite over Azure Storage Emulator?

Ever since I started playing with Azure back in 2008, I've been using the [Azure Storage Emulator](https://docs.microsoft.com/en-us/azure/storage/common/storage-use-emulator) to have a local storage emulator to develop with. It provides a local environment for testing applications that use Azure blob and/or queues.

I felt it was time to retire the Azure Storage Emulator in favor of its successor: [Azurite](https://github.com/Azure/Azurite). There are various reasons for this:

* Azurite supports newer storage API's.
* It can run as a Docker container.
* By setting its volume path to something relative to the solution we're working on, we can keep blobs and queues around. Different solution? Different path! The blobs and queues related to that solution in Azurite.

## Setting up Azurite

We can run Azurite using Docker, by running the following command:

```
docker run -p 10000:10000 -p 10001:10001 mcr.microsoft.com/azure-storage/azurite
```

This will fetch and run the [`mcr.microsoft.com/azure-storage/azurite`](https://hub.docker.com/_/microsoft-azure-storage-azurite) image, exposing ports `10000` (blob) and `10001` (queue).

Inside the Docker container, Azurite uses the `/data` folder to store blobs and queue messages. This means that we can map `/data` to a folder on our host machine. When working on different projects and solution, this is great! For every solution, we can map a different path, and preserve the blobs and queues related to that solution in Azurite.

## Setting up an Azurite run configuration in Rider

In Rider, we can create a new Run Configuration (**Run \| Edit Configurations**), of the type *Docker Image*, and enter the image ID as `mcr.microsoft.com/azure-storage/azurite`. Optionally, we can name the container (I picked `azurite` here).

We'll also have to specify the port bindings (port `10000` and `10001`).

Since we want to preserve the Azurite data locally with our solution, we can create a bind mount as well. In the below screenshot, you can see I mapped `D:\Projects\Git\NuGetTypeSearch\.idea\azurite` to `/data` in the container.

![Run Azurite - storage emulator, using JetBrains Rider](/images/2020/06/azurite-azure-storage-in-rider.png)

*Note: The `D:\Projects\Git\NuGetTypeSearch\.idea\azurite` path was added into `.gitignore` to make sure blobs/queue messages are not committed to Git.*

Once this run configuration is created, we can select and run it. This can be done from the toolbar, but I personally prefer using the <kbd>Ctrl+Alt+Shift+R</kbd> keyboard shortcut, where it's possible to immediately select the run configuration to execute (<kbd>Enter</kbd>) or debug (<kbd>Shift</kbd>, then <kbd>Enter</kbd>).

![Run Configuration in Rider](/images/2020/06/run-azurite-in-rider-configuration.png)

Once running, we can see the Azurite container's output from the **Services** tool window, but usually we will not need that one.

Want to start running an Azure Functions host next? We can use the respective run configuration for that. And when we switch to another solution, we can stop the current container and start it anew in the other solution, with its own data.

Enjoy!