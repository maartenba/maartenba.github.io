---
layout: post
title: "CarTrackr on Windows Azure - Part 5 - Deploying in the cloud"
pubDatetime: 2008-12-19T09:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/12/19/cartrackr-on-windows-azure-part-5-deploying-in-the-cloud.html
---
This post is part 5 (and the final part) of my series on [Windows Azure](http://www.microsoft.com/azure), in which I'll try to convert my ASP.NET MVC application into a cloud application. The current post is all about deploying CarTrackr in the cloud after all modifications done in previous posts.

Other parts:

- [Part 1 - Introduction](/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx), containg links to all other parts
- [Part 2 - Cloud-enabling CarTrackr](/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx)
- [Part 3 - Data storage](/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx)
- [Part 4 - Membership and authentication](/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx)
- Part 5 - Deploying in the cloud (current part)

## Deploying CarTrackr on Azure

Deploying CarTrackr is done using the Azure developer portal. I'm creating a hosted service named "CarTrackr", which will host the cloud version of CarTrackr. I'm also creating a second storage acocunt project, used for TableStorage of all data in CarTrackr.

![CarTrackr projects on Azure](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_943ef727-019d-4184-b63d-43b7b4db7bbe.png)

To create a deployment package, the documentation states to right-click the Azure project in the CarTrackr solution, selecting "Publish...". I really hoped this would be easy. Unfortunately, this was some sort of a [PITA](http://www.acronymfinder.com/PITA.html)... Great to see an Exception in the output window. Fortunately, someone had the same issue: [Packaging Azure project manually when the 'Publish' action fails](http://www.shanmcarthur.net/cloud-services/azure-tips/publishing-manually-when-publish-action-fails). The Exception seems to be thrown because the CarTrackr project is too big for the packaging system. *sigh* Starting an Azure SDK command-line and invoking the *cspack.exe* seemed to do the trick.

Anyway, on to uploading the generated package to Azure: the package, service configuration and deployment name should be given, after which an upload takes place.

![Azure Services Developer Portal](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_6d5b06d3-dd2c-4884-b8a3-5e1a6a1b44fc.png)

Time to run! After browsing to [http://cartrackr.cloudapp.net](http://cartrackr.cloudapp.net), I'm expecting to see CarTrackr!

![CarTrackr running... NOT!](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_b22a129d-1b8b-4f6b-9eda-47e51fc19373.png)

But no, Error 403 - Forbidden - Access is denied... What is wrong? My quest to host CarTrackr on Azure seems to be full of obstacles...

## Deploying again!

After some hours of re-packing, re-building, re-deploying and starting to get annoyed, the solution was to change my call to cspack.exe... Not only the /bin folder should be packaged, but also all other content. My bad! Invoking *C:\Users\Maarten\Desktop\CarTrackr>cspack "./CarTrackr_Azure/ServiceDefinition.csdef" /out:"./CarTrackr_Azure/CarTrackr_Azure.cspkg" /role:"Web;./CarTrackr"*  was the right thing to do.

A deployment later, CarTrackr seemed to work smoothly!

![CarTrackr on Azure!](/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_d63b2539-5304-4e80-befa-502a5c21db74.png)

## And again...

Yes, again. I wrote this blog post about a week ago and decided to add Google Analytics in the live version of CarTrackr. While deploying, I decided to upload the latest version to the staging environment, and swap it with the production environment... Bad idea :-) Deployment totally killed my data storage (it seemed) and was throwing strange errors on the production URL.

Some hours later (that is: 2 hours of build, deploy, check, ..., a night sleep and some more build, deploy, check, ...), I had the strange idea of putting my production ServiceConfiguration data in the package itself. This should not be necessary, but you never know. And it is what I did with the first working production deployment. And yes, this indeed seemed to be the solution!

## Check it out!

Checkout [http://cartrackr.cloudapp.net](http://cartrackr.cloudapp.net) for the live version. No need to sign up, only to sign in. *Note: when entering a refuelling, enter the date in US English format...*

It is likely that you are going to download and play with my source code. When doing that, check out the TableStorage membership, role and session providers in the Azure SDK, which you can use in CarTrackr if you want. More on this can be found on [http://blogs.msdn.com/jnak/archive/2008/11/10/asp-net-mvc-on-windows-azure-with-providers.aspx](http://blogs.msdn.com/jnak/archive/2008/11/10/asp-net-mvc-on-windows-azure-with-providers.aspx).

Looking for the Azure CarTrackr sources? [CarTrackr_Azure.zip (654.98 kb)](/files/CarTrackr_Azure.zip)

Looking for the original CarTrackr sources? Checkout [CodePlex](http://www.codeplex.com/CarTrackr).

## Conclusion on Azure

It took me quite some hours to actually convert an existing application into something that was ready for deployment on Azure. The toughest parts were rewriting my repository code for TableStorage and getting the CarTrackr package deployed. With what I know know, I think writing an Azure application should not be more difficult than writing any other web application. The [SDK](http://www.azure.com) provides everything you need, remember to check the samples directory for some useful portions of code.

I do have some notes though, which I hope will be used for future CTP's of Azure...

- Your application is running fine on the development fabric?

	*There's no 100% guarantee that the Azure web fabric will serve your application correctly when it runs smoothly on the development fabric. Just deploy and pray :-)*
- Viewing log files from the web fabric from the Azure Services Developer Portal would be a real time saver!

	*Currently, you can copy the server logs to blob storage and then fetch the data from there, but a handy web-tool would really save some time when something goes wrong after deployment. Same story goes for TableStorage: it would be useful to have an interface to look at your data.*
- Packaging? Great, but... what if I only wanted to update one file in the application?

	*I've uploaded my package about 10 times during deployment testing, which required 10 times... the full package size in bandwith! And all I wanted to do was modifying web.config...*

*Sidenote: f**unny to see that they are using OPC (Open Packaging Convention) for creating deployment packages. It shows how easy it is to create a custom file format with OPC, just like J[ulien Chable did for a photo viewer](http://blogs.developpeur.org/neodante/archive/2008/12/09/open-xml-open-packaging-convention-can-do-more-than-just-office-documents.aspx).*

Overall, Microsoft is doing a good job with Azure. The platform itself seems reliable and stable, the concept is good. Perhaps they should consider selling the hosting platform itself to hosting firms around the globe, setting a standard for hosting platforms. Think of switching your hosting provider by simply uploading the package to another company's web fabric and modifying some simple configuration entries. Another idea: why not allow the packages developed for Azure to be deployed on any IIS server farm?
