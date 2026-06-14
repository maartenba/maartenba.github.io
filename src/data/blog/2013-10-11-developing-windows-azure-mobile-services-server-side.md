---
layout: post
title: "Developing Windows Azure Mobile Services server-side"
pubDatetime: 2013-10-11T08:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "JavaScript", "Software", "Source control", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/10/11/developing-windows-azure-mobile-services-server-side.html
---
*Word of warning: This is a partial cross-post from the *[*JetBrains WebStorm blog*](http://blog.jetbrains.com/webstorm/)*. The post you are currently reading adds some more information around Windows Azure Mobile Services and builds on a full example and is a bit more in-depth.*


With Microsoft’s [Windows Azure Mobile Services](http://www.windowsazure.com/en-us/develop/mobile/), we can build a back-end for iOS, Android, HTML, Windows Phone and Windows 8 apps that supports storing data, authentication, push notifications across all platforms and more. There are [client libraries](http://www.windowsazure.com/en-us/develop/mobile/tutorials/get-started/) available for all these platforms which can be used when developing in an IDE of choice, e.g. [AppCode](http://www.jetbrains.com/objc/), [Google Android Studio](http://developer.android.com/sdk/installing/studio.html) or [Visual Studio](http://www.visualstudio.com). In this post, let’s focus on what these different platforms have in common: the server-side code.


This post was sparked by my buddy [Kristof Rennen](http://azug.be/2013-09-26---going-mobile-with-windows-azure-mobile-services-video)’s session for [our user group](http://www.azug.be). During his session he mentioned a couple of times how he dislikes Node.js and the trial-and-error manner of building the server-side due to lack of good tooling. Working for a [tooling vendor](http://www.jetbrains.com) and intrigued by the quest of finding a better way, I decided to post the short article you are currently reading.


Do note that I will focus more on how to get your development environment set-up and less on the Windows Azure Mobile Services feature set. Yes, you *will* learn some of the very basics but there are [way better resources available](http://www.thejoyofcode.com/The_twelve_days_of_ZUMO.aspx) for getting in-depth knowledge on the topic.


Here’s what we will see in this post:


- Setting up a Windows Azure Mobile Service
- Creating a table and storing data
- A simple HTML/JS client
- Adding logic to our API
- Working on server-side logic with WebStorm
- Sending e-mail using an Node.js module
- Putting our API to the test with the REST client
- Unit testing our logic


## <a name="h.ngq0jde8fwyr"></a>The scenario


Doing some exploration is always more fun when we can do it based on a simple scenario. Whenever JetBrains goes to a conference and we have a booth, we like to do a raffle for licenses. The idea is simple: come to our booth for a chat, fill out a simple form and we will pick random names after the conference and send a free license.


For this post, I’ve created a very simple form in HTML and JavaScript, collecting visitor name and e-mail address.


[![](/images/1_thumb_2.png)](/images/1_2.png)


Once someone participates in the raffle, the name and e-mail address are stored in a database and we send out an e-mail thanking that person for visiting the booth together with a link to download a product trial.


## Setting up a Windows Azure Mobile Service


First things first: we will require a [Windows Azure account](http://www.windowsazure.com/en-us/pricing/free-trial/) to start developing. Next, we can create a new Mobile Service through the Windows Azure [Management Portal](https://manage.windowsazure.com).


[![](/images/2_thumb_1.png)](/images/2_1.png)


Next, we can give our service a name and pick the datacenter location for it. We also have to provide the type of database we want to use: a free, 20 MB database, or a full-fledged SQL Database. While Windows Azure Mobile Services is always coupled to a database, we can build a custom API with it as well.


[![](/images/3_thumb_1.png)](/images/3_1.png)


Once completed, we get several tabs to work with. There’s the initial welcome screen, displaying links to documentation and client libraries. The other tabs give access to monitoring, scaling, how we want to authenticate users, push notification settings and logs. Since we want to store data of booth visitors, let’s enter the *Data* tab.


## <a name="h.k8wij3yja2zo"></a>Creating a table and storing data


From the *Data* tab, we can create a new table. Let’s call it *Visitor*. When creating a new table, we have to specify access rules for the API that will be available on top of it.


[![](/images/4_thumb_1.png)](/images/4_1.png)


We can tell who can read (API GET request), insert (API POST request), update (API PATCH request) and delete (API DELETE request). Since our application will only insert new data and we don’t want to force booth visitors to log in with their social profiles, we can specify inserts can be done if an API key is provided. All other operations will be blocked for outside users: reading and deleting will only be available through the Windows Azure Management Portal with the above settings.


Do we have to create columns for storing booth visitor data? By default, Windows Azure Mobile Services has “dynamic schema” enabled which means we can throw some JSON at our Mobile Service it and it will store data for us.


## <a name="h.samtm7qpf0l1"></a>A simple HTML/JS client


As promised earlier in this post, let’s see how we can build a simple client for the service we have just created. We’ll go with an HTML and JavaScript based client as it’s fairly easy to demonstrate. Again, have a look at [other client SDK’s](http://www.windowsazure.com/en-us/develop/mobile/tutorials/get-started/) for the platform you are developing for.


Our HTML page exists of nothing but two text boxes and a button, conveniently named *name*, *email* and *send*. There are two ways of sending data to our Mobile Service: calling the API directly or making use of the client library provided. Both are easy to do: the API lives at *https://<servicename>.azure-mobile.net/tables/*<tablename> and we can POST a JSON-serialized object to it, an approach we’ll take later in this blog post. There is also a JavaScript client library available from *https://<servicename>.azure-mobile.net/client/MobileServices.Web-1.0.0.min.js* which our client is using.


[![](/images/5_thumb_1.png)](/images/5_1.png)


As we can see, a new *MobileServiceClient *is created on which we can get a table reference (*getTable*) and insert a JSON-formatted object. Do note that we have to pass in an API key in the client constructor, which can be obtained from the Windows Azure Management Portal under the *Manage Keys* toolbar button.


From the portal, we can now see the data we’re submitting from our simple application:


[![](/images/6_thumb_1.png)](/images/6.png)


## <a name="h.7fcqnyr38t6"></a>Adding logic to our API


Let’s make it a bit more exciting! What if we wanted to store a timestamp with every record? We may want to have some insight into when our booth was busiest. We can send a timestamp from the client but that would only add clutter to our client-side code. Also if we wanted to port the HTML/JS client to other platforms it would mean we have to make sure every client sends this data to our mobile service. In short: this calls for some server-side logic.


For every table created, we can make use of the *Script* tab to add custom logic to read, insert, update and delete operations which we can write in JavaScript. By default, this is what a script for insert may look like:


[![](/images/7_thumb_1.png)](/images/7_1.png)


The *insert *function will be called with 3 parameters: the item to be stored (our JSON-serialized object), the current user and the full request. By default, the *request.execute()* function is called which will make use of the other two parameters internally. Let’s enrich our item with a timestamp.


[![](/images/8_thumb_1.png)](/images/8_1.png)


Hitting *Save* will deploy this script to our mobile service which from now on will store an inserted timestamp in our database as well.


This is a very trivial example. There are a lot of things that can be done server-side: enforcing validation, record filtering, storing data in other tables as well, sending e-mail or text messages, … Here’s [a post](http://chrisrisner.com/Common-Scenarios-with-Windows-Azure-Mobile-Services) with some common scenarios. [Full reference](http://msdn.microsoft.com/en-us/library/windowsazure/jj554226.aspx) to the server-side objects is also available.


## <a name="h.cocp5dwgnx7k"></a>Working on server-side logic with WebStorm


Unfortunately, the in-browser editor for server-side scripts is a bit limited. It features no autocompletion and all code has to go in one file. How would we create shared logic which can be re-used across different scripts? How would we unit test our code? This is where WebStorm comes in. We can access the complete server-side code through a Git repository and work on it in a full IDE!


The Git access to our mobile service is disabled by default. Through the portal’s right-hand side menu, we can enable it by clicking the *Set up source control* link. Next, we can find repository details from the *Configure* tab.


[![](/images/9_thumb_1.png)](/images/9_1.png)


We can now use WebStorm’s ***VCS | Checkout From Version Control | Git*** menu to bring down the server-side code for our Windows Azure Mobile Service.


[![](/images/10_thumb_1.png)](/images/10_1.png)


In our project, we can see several folders and files. The *service/api* folder can hold custom API’s (check the *readme.md* file for more info). *service/scheduler* can hold scripts that execute at a given time or interval, much like CRON jobs. *service/shared* can hold shared scripts that can be used inside table logic, custom API’s and scheduler scripts. In the *service/table* folder we can find the script we have created through the portal: *visitor.insert.js*. Also note the *visitor.json* file which contains the access rules we configured through the portal earlier.


[![](/images/11_thumb.png)](/images/11.png)


From now on, we can work inside WebStorm and push to the remote Git repository if we want to deploy our new code.


## <a name="h.j9accqs9jd36"></a>Sending e-mail using a Node.js module


Let’s go back to our initial requirements: whenever someone enters their name and e-mail address in our application, we want to send out an e-mail thanking them for participating. We can do this by making use of an NPM module, for example [SendGrid](https://npmjs.org/package/sendgrid).


Windows Azure Mobile Services comes with some NPM modules preinstalled, like [SendGrid](https://npmjs.org/package/sendgrid) and [Twilio](http://www.windowsazure.com/en-us/develop/mobile/tutorials/twilio-for-voice-and-sms/). However we want to make sure we are always using the same version of the NPM package, so let’s install it into our project. WebStorm has a built-in package manager to do this, however Windows Azure Mobile Services requires us to install the module in a non-standard location (the *service *folder) hence we will use the *Terminal* tool window to install it.


[![](/images/12_thumb.png)](/images/12.png)


Once finished, we can start working on our e-mail logic. Since we may want to re-use the e-mail logic (and we want to unit test it later), it’s best to create our logic in the *shared* folder.


[![](/images/13_thumb.png)](/images/13.png)


In our shared module, we can make use of the SendGrid module to create and send an e-mail. We can export our *sendThankYouMessage* function to consumers of our shared module. In the *visitor.insert.js* script we can require our shared module and make use of the functionality it exposes. And as an added bonus, WebStorm provides us with autocompletion, code analysis and so on.


[![](/images/14_thumb.png)](/images/14.png)


Once we’ve updated our code, we can transfer our server-side code to Windows Azure Mobile Services. ***Ctrl+K*** (or ***Cmd+K on Mac OS X***) allows us to commit and push from within the IDE.


[![](/images/15_thumb.png)](/images/15.png)


## <a name="h.2wxnw578w1zl"></a>Putting our API to the test with the REST client


Once our changes have been deployed, we can test our API. This can be done using one of the client libraries or by making use of WebStorm’s built-in REST client. From the ***Tools | Test RESTful Web Service*** menu we can craft our API calls manually.


We can specify the HTTP method to use (POST since we want to insert) and the URL to our Windows Azure Mobile Services endpoint. In the headers section, we can add a *Content-Type* header and set it to *application/json*. We also have to specify an API key in the *X-ZUMO-APPLICATION* header. This API key can be found in the Windows Azure Management Portal. On the right-hand side we can provide the text to post, in this case a JSON-serialized object with some properties.


[![](/images/16_thumb.png)](/images/16.png)


After running the request, we get back response headers and a response body:


[![](/images/17_thumb_2.png)](/images/17_2.png)


No error message but an object is being returned? Great, that means our code works (and should also be sending out an e-mail). If something does go wrong, the *Logs* tab in the Windows Azure portal can be a tremendous help in finding out what went wrong.


Through the toolbar on the left, we can export/import requests, making it easy to create a number of predefined requests that can easily be run over and over for testing the REST API.


## <a name="h.jsmhrky49c8i"></a>Unit testing our logic


With WebStorm we can easily test our JavaScript code and custom Node.js modules. Let’s first set up our IDE. Unit testing can be done using the[nodeunit](https://npmjs.org/package/nodeunit) testing framework which we can install using the Node.js package manager.


[![](/images/18_thumb_2.png)](/images/18_2.png)


Next, we can create a new Run Configuration from the toolbar selecting *Nodeunit* as the configuration type and entering all required configuration details. In our case, let’s run all tests from the *test* directory.


[![](/images/19_thumb_1.png)](/images/19_1.png)


Next, we can create a folder that will hold our tests and mark it as a Test Source Root (open the context menu and use ***Mark Directory As | Test Source Root***). Tests for Nodeunit are always considered modules and should export their test functions. Here’s a very basic example which tells Nodeunit to wait for one assertion, assert that a boolean is true and marks the test case completed.


[![](/images/20_thumb.png)](/images/20.png)


Of course we can also test our business logic. It’s best to create separate modules under the *shared* folder as they will be easier to unit test. However if you do have to test the actual table scripts (like *insert* functionality), there is a little trick that allows doing just that. The following snippet exports the insert function outside of the table-specific module:


[![](/images/21_thumb.png)](/images/21.png)


We can now test the complete *visitor.insert.js* module and even provide mocks to work with. The following example loads all our modules and sets up test expectation. We’re also overriding specific functionalities such as the *sendThankYouMessage *function to just make sure it’s called by our table API logic.


[![](/images/22_thumb_1.png)](/images/22_1.png)


The full source code for both the server-side and client-side application can be found on[https://github.com/maartenba/JetBrainsBoothMobileService](https://github.com/maartenba/JetBrainsBoothMobileService).


If you would like to learn more about Windows Azure Mobile Services and work with authentication, push notifications or custom API’s checkout the [getting started documentation](http://www.windowsazure.com/en-us/develop/mobile/). And if you haven’t already, give [WebStorm](http://www.jetbrains.com/webstorm) a try.


Enjoy!
