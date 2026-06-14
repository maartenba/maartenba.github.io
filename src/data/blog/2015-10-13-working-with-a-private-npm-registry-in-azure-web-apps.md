---
layout: post
title: "Working with a private npm registry in Azure Web Apps"
pubDatetime: 2015-10-13T10:33:00Z
comments: true
published: true
categories: ["post"]
tags: ["Azure", "General", "ICT", "JavaScript", "Windows Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2015/10/13/working-with-a-private-npm-registry-in-azure-web-apps.html
---
Using [Azure Web Apps](https://azure.microsoft.com/en-us/documentation/services/app-service/web/), we can deploy and host Node applications quite easily. But what to do with packages the site depends on? Do we have to upload them manually to Azure Web Apps? Include them in our Git repository? None of that: we just have to make sure our app’s *package,json* is checked in so that Azure Web Apps can install them during deployment. Let’s see how.


## Installing node modules during deployment


In this blog post, we’ll create a simple application using [Express](http://expressjs.com/). In its simplest form, an Express application will map incoming request paths to a function that generates the response. This makes Express quite interesting to work with: we can return a simple string or delegate work to a full-fledged MVC component if we want to. Here’s the simplest application I could think of, returning “Hello world!” whenever the root URL is requested. We can save it as *server.js* so we can deploy it later on.


```javascript
var express = require("express");
var app = express();

app.get("/", function(req, res) {
    res.send("Hello world!");
});

console.log("Web application starting...");
app.listen(process.env.PORT);
console.log("Web application started on port " + process.env.PORT);

```

Of course, this will not work as-is. We need to ensure Express (and its dependencies) are installed as well. We can do this using npm, running the following commands:

```bash

# create package.json describing our project

npm init

# install and save express as a dependency

npm install express --save

```

That’s pretty much it, running this is as simple as setting the PORT environment variable and running it using node.

```

set PORT=1234
node server.js

```

We can now commit our code, excluding the *node_modules* folder to our Azure Web App git repository. Ideally we create a *.gitignore *file that excludes this folder for once and for all. Once committed, Azure Web Apps starts a convention-based deployment process. One of the conventions is that for a Node application, all dependencies from *package.json* are installed. We can see this convention in action from the Azure portal.

[![](/images/image_thumb_320.png)](/images/image_360.png)

Great! Seems we have to do nothing special to get this to work. Except… What if we are using our *own, private npm modules*? How can we tell Azure Web Apps to make use of a different npm registry? Let’s see…

## Installing private node modules during deployment

When building applications, we may be splitting parts of the application into separate node modules to make the application more componentized, make it easier to develop individual components and so on. We can use a [private npm registry](http://www.myget.org/npm) to host these components, an example being [MyGet](http://www.myget.org). Using a private npm feed we can give our development team access to these components using “good old npm” while not throwing these components out on the public [npmjs.org](http://npmjs.org).

Imagine we have a module called *demo-site-pages* which contains some of the views our web application will be hosting. We can add a dependency to this module in our *package.json*:

```

{
  "name": "demo-site",
  "version": "1.0.0",
  "description": "Demo site",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "dependencies": {
    "express": "^4.13.3",
    "demo-site-pages": "*"
  }
}

```

Alternatively we could install this package using npm, specifying the registry directly:

```bash
npm install --save --registry https://www.myget.org/F/demo-site/npm/

```

But now comes the issue: if we push this out to Azure Web Apps, our private registry is not known!

###

### Generating a .npmrc file to work with a private npm registry in Azure Web Apps

To be able to install node modules from a private npm registry during deployment on Azure Web Apps, we have to ship a *.npmrc* file with our code. Let’s see how we can do this.

> Since our application uses both npmjs.org as well as our private registry, we want to make sure MyGet proxies packages used from npmjs.org during installation. We can enable this from our feed’s ***Package Sources*** tab and edit the default *Npmjs.org* package source source. Ensure the **Make all upstream packages available in clients* ***option is checked.

Next, [register your MyGet NPM feed](http://docs.myget.org/docs/walkthrough/getting-started-with-npm) (or another registry URL). The easiest way to do this is by running the following commands:

```bash
npm config set registry https://www.myget.org/F/your-feed-name/npm
npm login --registry=https://www.myget.org/F/your-feed-name/npm
npm config set always-auth true

```

This generates a *.npmrc* file under our user profile folder. On Windows that would be something like C*:\Users\Username\.npmrc*. Copy this file into the application’s root folder and open it in an editor. Depending on the version of npm being used, we may have to set the *always-auth* setting to *true*:

```

registry=https://www.myget.org/F/demo-site/npm
//www.myget.org/F/demo-site/:_password="BASE64ENCODEDPASSWORD"
//www.myget.org/F/demo-site/:username=maartenba
//www.myget.org/F/demo-site/:email=maarten@myget.org
//www.myget.org/F/demo-site/:always-auth=true

```

If we now commit this file to our git repository, the next deployment on Azure Web Apps will install both packages from npmjs.org, in this case express, as well as packages from our private npm registry.

[![](/images/image_thumb_321.png)](/images/image_361.png)

Enjoy!
