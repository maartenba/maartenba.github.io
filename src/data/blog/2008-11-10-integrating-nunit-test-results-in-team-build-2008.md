---
layout: post
title: "Integrating NUnit test results in Team Build 2008"
pubDatetime: 2008-11-10T17:16:00Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/11/10/integrating-nunit-test-results-in-team-build-2008.html
---
<p>
When using Team Foundation Server 2008 and Team Build, chances are you are developing unit tests in Microsoft&rsquo;s test framework which is integrated with Visual Studio 2008. This integration offers valuable data hen a build has been finished on the build server: test run results are published in the Team Foundation Server 2008 data warehouse and can be used to create detailed metrics on how your development team is performing and what the quality of the product being developed is. 
</p>
<p>
Not all software development teams are using Microsoft&rsquo;s test framework. Perhaps your team is using Team Foundation Server 2008 and creates (unit) tests using NUnit. By default, NUnit tests are not executed by the Team Build server nor are they published in the Team Foundation Server 2008 data warehouse. The following guide enables you to leverage the features Team Foundation Server 2008 has to offer regarding metrics, by customizing the build process with the necessary steps to publish test results. 
</p>
<p>
(cross-posted on <a href="http://realdolmenalm.blogspot.com/" target="_blank">RealDolmen ALM Blog</a>) 
</p>
<h2>1. Prerequisites</h2>
<p>
Make sure the following prerequisites are present on your Team Build server (in addition to a default build server installation): 
</p>
<ul>
	<li>NUnit - <a href="http://www.nunit.org">http://www.nunit.org</a><br />
	<em>This guide uses version 2.4.8, other versions will probably work in the same manner.<br />
	</em></li>
	<li>MSBuild Community Tasks - <a href="http://msbuildtasks.tigris.org">http://msbuildtasks.tigris.org</a><br />
	<em>The MSBuild Community Tasks Project is an open source project for MSBuild tasks. The goal of the project is to provide a collection of open source tasks for MSBuild.<br />
	</em></li>
	<li>NXSLT.exe - <a href="http://www.xmllab.net/Downloads/tabid/61/Default.aspx">http://www.xmllab.net/Downloads/tabid/61/Default.aspx.html</a><br />
	<em>NXSLT is a free XSLT command line tool.<br />
	</em></li>
	<li>NUnit for Team Build - <a href="http://www.codeplex.com/nunit4teambuild">http://www.codeplex.com/nunit4teambuild</a><br />
	<em>A set of XSLT templates which can be used for transforming NUnit test results into Microsoft Test results.</em></li>
</ul>
<h2>2. Registering NUnit framework in the global assembly cache (GAC)</h2>
<p>
For NUnit tests to be run in a Team Build script, make sure that the NUnit framework is registered in the global assembly cache (GAC). This can be achieved by copying the file <em>C:\Program Files\NUnit 2.4.8\bin\nunit.framework.dll</em> to <em>C:\Windows\Assembly</em>. 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/IntegratingNUnittestresultsinTeamBuild20_F2E5/clip_image002_ca508bc2-0cee-42a5-96dd-d58b7ba5381c.jpg" border="0" alt="clip_image002" width="609" height="381" /> 
</p>
<h2>3. Customizing a build script</h2>
<p>
After installing all prerequisites, make sure you know all paths where these tools are installed before continuing. 
</p>
<p>
The build script for a NUnit enabled build should be modified in several locations. First of all, the MSBuild Community Tasks target file should be referenced. Next, a new build step is added in the AfterCompile hook of the build script. This build step will run the NUnit tests in the compiled DLL&rsquo;s, transform them to a Microsoft Test results file (*.trx) and publish this transformed file to the Team Foundation Server 2008. 
</p>
<p>
Open the TFSBuild.proj file from source control and merge the following lines in: 
```xml
<?xml version="1.0" encoding="utf-8"?>
<Project DefaultTargets="DesktopBuild" xmlns="http://schemas.microsoft.com/developer/msbuild/2003" ToolsVersion="3.5">
    <!-- Do not edit this -->
    <Import Project="$(MSBuildExtensionsPath)\Microsoft\VisualStudio\TeamBuild\Microsoft.TeamFoundation.Build.targets" />
    <Import Project="$(MSBuildExtensionsPath)\MSBuildCommunityTasks\MSBuild.Community.Tasks.targets" />
    <ProjectExtensions>
        <!-- ... -->
    </ProjectExtensions>
    <!-- At the end of file: -->
    <ItemGroup>
        <AdditionalReferencePath Include="$(ProgramFiles)\Nunit 2.4.7\bin\" />
    </ItemGroup>
    <Target Name="AfterCompile">
        <!-- Create a Custom Build Step -->
        <BuildStep TeamFoundationServerUrl="$(TeamFoundationServerUrl)" BuildUri="$(BuildUri)" Name="NUnitTestStep" Message="Running NUnit Tests">
            <Output TaskParameter="Id" PropertyName="NUnitStepId" />
        </BuildStep>
        <!-- Get Assemblies to test -->
        <ItemGroup>
            <TestAssemblies Include="$(OutDir)\**\Calculator.dll"/>
        </ItemGroup>
        <!-- Run NUnit and check the result -->
        <NUnit ContinueOnError="true" Assemblies="@(TestAssemblies)" OutputXmlFile="$(OutDir)nunit_results.xml" ToolPath="$(ProgramFiles)\Nunit 2.4.8\bin\">
            <Output TaskParameter="ExitCode" PropertyName="NUnitResult" />
        </NUnit>
        <BuildStep Condition="'$(NUnitResult)'=='0'" TeamFoundationServerUrl="$(TeamFoundationServerUrl)" BuildUri="$(BuildUri)" Id="$(NUnitStepId)" Status="Succeeded" />
        <BuildStep Condition="'$(NUnitResult)'!='0'" TeamFoundationServerUrl="$(TeamFoundationServerUrl)" BuildUri="$(BuildUri)" Id="$(NUnitStepId)" Status="Failed" />
        <!-- Regardless of NUnit success/failure merge results into the build -->
        <Exec Command="&quot;$(ProgramFiles)\nxslt-2.3-bin\nxslt2.exe&quot; &quot;$(OutDir)nunit_results.xml&quot; &quot;$(ProgramFiles)\MSBuild\NUnit\nunit transform.xslt&quot; -o &quot;$(OutDir)nunit_results.trx&quot;"/>
        <Exec Command="&quot;$(ProgramFiles)\Microsoft Visual Studio 9.0\Common7\IDE\mstest.exe&quot; /publish:$(TeamFoundationServerUrl) /publishbuild:&quot;$(BuildNumber)&quot; /publishresultsfile:&quot;$(OutDir)nunit_results.trx&quot; /teamproject:&quot;$(TeamProject)&quot; /platform:&quot;%(ConfigurationToBuild.PlatformToBuild)&quot; /flavor:&quot;%(ConfigurationToBuild.FlavorToBuild)&quot;" IgnoreExitCode="true" />
        <!-- If NUnit failed it's time to error out -->
        <Error Condition="'$(NUnitResult)'!='0'" Text="Unit Tests Failed" />
    </Target>
</Project>
```

<h2>4. Viewing test results</h2>
<p>
When a build containing NUnit tests has succeeded, results of this tests are present in the build log: 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/IntegratingNUnittestresultsinTeamBuild20_F2E5/clip_image004_4a8e647d-54bf-42ad-bd14-9920e575ca78.jpg" border="0" alt="clip_image004" width="609" height="386" /> 
</p>
<p>
When clicking the test results hyperlink, Visual Studio retrieves the result file from Team Foundation Server 2008 and displays it in the test results panel: 
</p>
<p>
<img style="margin: 5px; border: 0px" src="/images/WindowsLiveWriter/IntegratingNUnittestresultsinTeamBuild20_F2E5/clip_image006_21f9286e-d0bd-4558-a467-21b28a75aa23.jpg" border="0" alt="clip_image006" width="609" height="99" /> 
</p>
<p>
<a href="http://www.dotnetkicks.com/kick/?url=/post/2008/11/10/Integrating-NUnit-test-results-in-Team-Build-2008.aspx&amp;title=Integrating NUnit test results in Team Build 2008"><img src="http://www.dotnetkicks.com/Services/Images/KickItImageGenerator.ashx?url=/post/2008/11/10/Integrating-NUnit-test-results-in-Team-Build-2008.aspx" border="0" alt="kick it on DotNetKicks.com" width="82" height="18" /> </a>
</p>


