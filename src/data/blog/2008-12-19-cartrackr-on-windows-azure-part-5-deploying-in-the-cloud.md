---
layout: post
title: "CarTrackr on Windows Azure - Part 5 - Deploying in the cloud"
pubDatetime: 2008-12-19T09:40:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "Azure", "CSharp", "General", "MVC"]
author: Maarten Balliauw
---
<p>
This post is part 5 (and the final part) of my series on <a href="http://www.microsoft.com/azure" target="_blank">Windows Azure</a>, in which I&#39;ll try to convert my ASP.NET MVC application into a cloud application. The current post is all about deploying CarTrackr in the cloud after all modifications done in previous posts. 
</p>
<p>
Other parts: 
</p>
<ul>
	<li><a href="/post/2008/12/09/track-your-car-expenses-in-the-cloud!-cartrackr-on-windows-azure-part-1-introduction.aspx" target="_blank">Part 1 - Introduction</a>, containg links to all other parts </li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-2-cloud-enabling-cartrackr.aspx" target="_blank">Part 2 - Cloud-enabling CarTrackr</a> </li>
	<li><a href="/post/2008/12/09/cartrackr-on-windows-azure-part-3-data-storage.aspx" target="_blank">Part 3 - Data storage</a> </li>
	<li><a href="/post/2008/12/11/cartrackr-on-windows-azure-part-4-membership-and-authentication.aspx" target="_blank">Part 4 - Membership and authentication</a> </li>
	<li>Part 5 - Deploying in the cloud (current part)</li>
</ul>
<h2>Deploying CarTrackr on Azure</h2>
<p>
Deploying CarTrackr is done using the Azure developer portal. I&#39;m creating a hosted service named &quot;CarTrackr&quot;, which will host the cloud version of CarTrackr. I&#39;m also creating a second storage acocunt project, used for TableStorage of all data in CarTrackr. 
</p>
<p align="center">
<img style="margin: 5px; border-width: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_943ef727-019d-4184-b63d-43b7b4db7bbe.png" border="0" alt="CarTrackr projects on Azure" width="609" height="205" /> 
</p>
<p>
To create a deployment package, the documentation states to right-click the Azure project in the CarTrackr solution, selecting &quot;Publish...&quot;. I really hoped this would be easy. Unfortunately, this was some sort of a <a href="http://www.acronymfinder.com/PITA.html" target="_blank">PITA</a>... Great to see an Exception in the output window. Fortunately, someone had the same issue: <a href="http://www.shanmcarthur.net/cloud-services/azure-tips/publishing-manually-when-publish-action-fails" target="_blank">Packaging Azure project manually when the &#39;Publish&#39; action fails</a>. The Exception seems to be thrown because the CarTrackr project is too big for the packaging system. *sigh* Starting an Azure SDK command-line and invoking the <em>cspack.exe</em> seemed to do the trick. 
</p>
<p>
Anyway, on to uploading the generated package to Azure: the package, service configuration and deployment name should be given, after which an upload takes place. 
</p>
<p align="center">
<img style="margin: 5px; border-width: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_6d5b06d3-dd2c-4884-b8a3-5e1a6a1b44fc.png" border="0" alt="Azure Services Developer Portal" width="609" height="335" /> 
</p>
<p>
Time to run! After browsing to <a href="http://cartrackr.cloudapp.net">http://cartrackr.cloudapp.net</a>, I&#39;m expecting to see CarTrackr! 
</p>
<p align="center">
<img style="margin: 5px; border-width: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_b22a129d-1b8b-4f6b-9eda-47e51fc19373.png" border="0" alt="CarTrackr running... NOT!" width="609" height="109" /> 
</p>
<p>
But no, Error 403 - Forbidden - Access is denied... What is wrong? My quest to host CarTrackr on Azure seems to be full of obstacles... 
</p>
<h2>Deploying again!</h2>
<p>
After some hours of re-packing, re-building, re-deploying and starting to get annoyed, the solution was to change my call to cspack.exe... Not only the /bin folder should be packaged, but also all other content. My bad! Invoking <em>C:\Users\Maarten\Desktop\CarTrackr&gt;cspack &quot;./CarTrackr_Azure/ServiceDefinition.csdef&quot; /out:&quot;./CarTrackr_Azure/CarTrackr_Azure.cspkg&quot; /role:&quot;Web;./CarTrackr&quot;</em>&nbsp; was the right thing to do. 
</p>
<p>
A deployment later, CarTrackr seemed to work smoothly! 
</p>
<p align="center">
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/CarTrackronWindowsAzurePart5Deployingint_A4EE/image_d63b2539-5304-4e80-befa-502a5c21db74.png" border="0" alt="CarTrackr on Azure!" width="528" height="454" /> 
</p>
<h2>And&nbsp;again...</h2>
<p>
Yes, again. I wrote this blog post about a week ago and decided to add Google Analytics in the live version of CarTrackr. While deploying, I decided to upload the latest version to the staging environment, and swap it with the production environment... Bad idea :-) Deployment totally killed my data storage (it seemed) and was throwing strange errors on the production URL. 
</p>
<p>
Some hours later (that is: 2 hours of build, deploy, check, ..., a night sleep and some more build, deploy, check, ...), I had the strange idea of putting my production ServiceConfiguration data in the package itself. This should not be necessary, but you never know. And it is what I did with the first working production deployment. And yes, this indeed seemed to be the solution! 
</p>
<h2>Check it out!</h2>
<p>
Checkout <a href="http://cartrackr.cloudapp.net">http://cartrackr.cloudapp.net</a> for the live version. No need to sign up, only to sign in.&nbsp;<em>Note: when entering a refuelling, enter the date in US English format...</em>&nbsp; 
</p>
<p>
It is likely that you are going to download and play with my source code. When doing that, check out the TableStorage membership, role and session providers&nbsp;in the Azure SDK, which you can use in CarTrackr if you want. More on this can be found on <a href="http://blogs.msdn.com/jnak/archive/2008/11/10/asp-net-mvc-on-windows-azure-with-providers.aspx" title="http://blogs.msdn.com/jnak/archive/2008/11/10/asp-net-mvc-on-windows-azure-with-providers.aspx">http://blogs.msdn.com/jnak/archive/2008/11/10/asp-net-mvc-on-windows-azure-with-providers.aspx</a>. 
</p>
<p>
Looking for the Azure CarTrackr sources? <a rel="enclosure" href="/files/CarTrackr_Azure.zip">CarTrackr_Azure.zip (654.98 kb)</a><br />
Looking for the original CarTrackr sources? Checkout <a href="http://www.codeplex.com/CarTrackr" target="_blank">CodePlex</a>. 
</p>
<h2>Conclusion on Azure</h2>
<p>
It took me quite some hours to actually convert an existing application into something that was ready for deployment on Azure. The toughest parts were rewriting my repository code for TableStorage and getting the&nbsp;CarTrackr package deployed. With what I know know, I think writing an Azure application should not be more difficult than writing any other web application. The <a href="http://www.azure.com" target="_blank">SDK</a> provides everything you need,&nbsp;remember to check the samples directory for some useful portions of code. 
</p>
<p>
I do have some notes though, which I hope will be used for future CTP&#39;s of Azure... 
</p>
<ul>
	<li>Your application is running fine on the development fabric?<br />
	<em>There&#39;s no 100% guarantee that the Azure web fabric will serve your application correctly when it runs smoothly on the development fabric. Just deploy and pray :-)</em></li>
	<li>Viewing log files from the web fabric from the Azure Services Developer Portal would be a real time saver!<br />
	<em>Currently, you can copy the server logs to blob storage and then fetch the data from there, but a handy web-tool would really save some time when something goes wrong after deployment. Same story goes for TableStorage: it would be useful to have an interface to look at your data.</em></li>
	<li>Packaging? Great, but... what if I only wanted to update one file in the application?<br />
	<em>I&#39;ve uploaded my package about 10 times during deployment testing, which required 10 times... the full package size in bandwith! And all I wanted to do was modifying web.config...</em></li>
</ul>
<p>
<em>Sidenote: f</em><em>unny to see that they are using OPC (Open Packaging Convention)&nbsp;for creating deployment packages. It shows how easy it is to create a custom file format with OPC, just like J<a href="http://blogs.developpeur.org/neodante/archive/2008/12/09/open-xml-open-packaging-convention-can-do-more-than-just-office-documents.aspx" target="_blank">ulien Chable did for a photo viewer</a>.</em> 
</p>
<p>
Overall, Microsoft is doing a good job with Azure. The platform itself seems reliable and stable, the concept is good. Perhaps they should consider&nbsp;selling the hosting platform itself to hosting firms around the globe, setting a standard for hosting platforms. Think of switching your hosting provider by simply uploading the package to another company&#39;s&nbsp;web fabric and modifying some simple configuration entries. Another&nbsp;idea: why not allow the packages developed for Azure to be deployed on any IIS server farm?&nbsp; 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/12/19/CarTrackr-on-Windows-Azure-Part-5-Deploying-in-the-cloud.aspx&amp;title=CarTrackr on Windows Azure - Part 5 - Deploying in the cloud">
                    <img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/12/19/CarTrackr-on-Windows-Azure-Part-5-Deploying-in-the-cloud.aspx" border="0" alt="kick it on DotNetKicks.com" />
                  </a>
</p>


{% include imported_disclaimer.html %}

