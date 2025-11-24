---
layout: post
title: "Remote debugging of Node.js apps on Azure App Service from WebStorm"
pubDatetime: 2018-05-29T04:44:04Z
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "Development", "Personal", "Azure", "Cloud", "Web"]
author: Maarten Balliauw
redirect_from:
  - /post/2018/05/29/remote-debugging-of-node-js-apps-on-azure-app-service-from-webstorm.html
---

At Microsoft Build 2018, a [number of Azure App Service on Linux enhancements](https://azure.microsoft.com/en-us/blog/app-service-adding-multi-container-capabilities-and-linux-support-for-app-service-environment/) were announced. One that I was interested in was this one:

> [Remote debugging](https://blogs.msdn.microsoft.com/appserviceteam/2018/05/07/remotedebugginglinux/), in public preview: You can now choose to remote debug your Node.JS applications running on App Service on Linux.

Sweet! But... how? The blog post did not mention a lot of details on the debugging part, so let's walk through it, shall we? **Remote debugging of Node.js apps on Azure App Service from WebStorm!**

## Prerequisites

First of all, we will need a number of things on our machine:

* The latest version of the **[Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)**
* The latest `webapp` CLI extension preview. To get it, open a command prompt, make sure the `az` command is on the `PATH`, and run:

  > `az extension add --name webapp`

  (or `az extension update --name webapp` if already installed)

Other thing we will need, of course, are an active Azure subscription, as well as an App Service on Linux that we can play with.

## 1. Setting up the Azure side

On the Azure side, there is only one thing that has to happen: our Node.js application has to run with node's `--inspect` flag.

And great news! As described in a [post by Kenneth Auchenberg](https://medium.com/@auchenberg/introducing-remote-debugging-of-node-js-apps-on-azure-app-service-from-vs-code-in-public-preview-9b8d83a6e1f0), things should "just work ™"!

Unfortunately, that did not work for me... At time of writing (see this post's publish date), debugging Node.js on App Service on Linux is still in preview and my guess is not all regions have the required magic deployed.

The good thing is development of many Azure things happens in the open! A bit of searching [revealed a pull request containing the required magic](https://github.com/Azure-App-Service/node/pull/37/files), and let me to discovering the one thing needed to get the Azure side of things set up: starting our app with the `--inspect` flag.

In the Azure portal, under our app's **Application settings**, we can **specify the startup file**. I am using a boilerplate Express app for which the normal startup command is `node ./bin/www`. Adding the `--inspect` flag means my startup command in Azure will become:

> `node --inspect=0.0.0.0:12345 /home/site/wwwroot/bin/www`

Or in the portal:

![Azure Portal - Setup node.js for debugging with WebStorm](/images/2018/05/azure-portal-node-startup.png)

## 2. Setting up an SSH and debugger tunnel

The [blog post about setting up an SSH tunnel with App Service on Linux](https://blogs.msdn.microsoft.com/appserviceteam/2018/05/07/remotedebugginglinux/) explains this in much more detail, but in order to be able to attach to the Node.js debugger, we will need two things:

* An SSH connection to our App Service on Linux
* Port forwarding from our own PC to the environment in Azure

Let's start with the SSH connection. Azure has no way to SSH into an App Service on Linux directly. Instead, the Azure CLI 2.0 has a command that sets up a private tunnel and exposes SSH. Make sure to check the prerequisites in this post, and then run this command:

> `az webapp remote-connection create -g RESOURCEGROUP_NAME_HERE -n WEBAPP_NAME_HERE -p 3008`

The Azure CLI tool will create a tunnel between our PC and our App Service on Linux (specified by resource group and web app name), and expose it over port `3008`:

![SSH tunnel to App Service on Linux](/images/2018/05/expose-ssh-from-app-service.png)

Once done, we can SSH into our app service using that port `3008` and the credentials displayed on the command line, which is kinda cool (and also kinda irrelevant to this post, but still cool):

![SSH into App Service on Linux](/images/2018/05/ssh-into-app-service-on-linux.png)

One thing left to do: in our first part, we told Node.js to listen on port `12345` (using the `--inspect=0.0.0.0:12345` flag). So we will need to setup some port forwarding so WebStorm can connect to this debugger port that lives in a remote data center.

### Setup port forwarding with an SSH client

Here's a one-liner if you have an SSH client installed:

> `ssh -L 12345:127.0.01:12345 root@127.0.0.1 -p 3008`

(In more human language: forward local port `12345` to the SSH host listening on port `3008`, binding to its local `127.0.01:12345` address and port.)

### Setup port forwarding with Putty

We can connect to `127.0.0.01` port `3008`. Under **Connection \| SSH \| Tunnels**, make sure to configure port forwarding first:

![Putty port forwarding](/images/2018/05/putty-port-forwarding.png)

## 3. Setting up the WebStorm side

In WebStorm, we can create a new *Run/Debug configuration* of type *Attach to Node.js/Chrome*. Since we are port forwarding the remote debugger port over an SSH tunnel on our PC's local port `12345`, we can configure WebStorm as such:

![Attach WebStorm to Node.js running in Azure App Service on Linux](/images/2018/05/attach-to-node-on-azure-webstorm.png)

Once done, all that is left is to set a breakpoint and run this new configuration (**Shift+F9**). Once we it our Azure App Service in the browser, WebStorm will pause execution and lets us inspect variables, step through code, etc.

![WebStorm - Debug node.js in Azure](/images/2018/05/webstorm-debug-node-azure.png)

## Summarized

Too long? Did not read? Here's a gist of things to do:

* Install [Azure CLI 2.0](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows?view=azure-cli-latest)
* Add the latest webapp extension preview: `az extension add --name webapp`
* Set our web app start command in App Service on Linux: `node --inspect=0.0.0.0:12345 /home/site/wwwroot/bin/www`
* Run `az webapp remote-connection create -g RESOURCEGROUP_NAME_HERE -n WEBAPP_NAME_HERE -p 3008` to setup an SSH tunnel
* Run `ssh -L 12345:127.0.01:12345 root@127.0.0.1 -p 3008` (or port forward in Putty) to setup a debugger tunnel on top of the SSH tunnel
* In WebStorm, create a new *Attach to Node.js/Chrome* run configuration that connects to `localhost` port `12345`
* Start debugging

Enjoy!

*PS: You want to know about that IDE theme? It's the [Material Theme UI](https://plugins.jetbrains.com/plugin/8006-material-theme-ui).*