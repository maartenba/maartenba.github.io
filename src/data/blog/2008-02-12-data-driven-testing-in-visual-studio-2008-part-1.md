---
layout: post
title: "Data Driven Testing in Visual Studio 2008 - Part 1"
pubDatetime: 2008-02-12T17:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/02/12/data-driven-testing-in-visual-studio-2008-part-1.html
---
Last week, I blogged about [code performance analysis in visual studio 2008](/post/2008/02/code-performance-analysis-in-visual-studio-2008.aspx). since that topic provoked [lots of comments](/post/2008/02/code-performance-analysis-in-visual-studio-2008.aspx#comment) (thank you [Bart](http://www.bartonline.be) for associating "hotpaths" with "hotpants"), thought about doing another post on code quality in .NET.

This post will be the first of two on Data Driven Testing. This part will focus on Data Driven Testing in regular Unit Tests. The second part will focus on the same in web testing.

- [Data Driven Testing in Visual Studio 2008 - Part 1 - Unit testing](/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx)
- [Data Driven Testing in Visual Studio 2008 - Part 2 - Web testing](/post/2008/02/data-driven-testing-in-visual-studio-2008---part-2.aspx)

## Data Driven Testing?

We all know unit testing. These small tests are always based on some values, which are passed throug a routine you want to test and then validated with a known result. But what if you want to run that same test for a couple of times, wih different data and different expected values each time?

Data Driven Testing comes in handy. Visual Studio 2008 offers the possibility to use a database with parameter values and expected values as the data source for a unit test. That way, you can run a unit test, for example, for all customers in a database and make sure each customer passes the unit test.

## Sounds nice! Show me how!

You are here for the magic, I know. That's why I invented this nifty web application which looks like this:

![Example application](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_17a765d8-01dc-49e8-b556-0fc923a2448c.png)

This is a simple "Calculator" which provides a user interface that accepts 2 values, then passes these to a *Calculator* business object that calculates the sum of these two values. Here's the *Calculator* object:

```csharp
public class Calculator
{
    public int Add(int a, int b)
    {
        return a + b;
    }
}

```

![Create Unit Tests...](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_31fb708b-3339-425c-999a-380f3f05f8d0.png)Now right-click the *Add* method, and select "Create Unit Tests...". Visual Studio will pop up a wizard. You can simply click "OK" and have your unit test code generated:

```csharp
/// <summary>
///A test for Add
///</summary>
[TestMethod()]
public void AddTest()
{
    Calculator target = new Calculator(); // TODO: Initialize to an appropriate value
    int a = 0; // TODO: Initialize to an appropriate value
    int b = 0; // TODO: Initialize to an appropriate value
    int expected = 0; // TODO: Initialize to an appropriate value
    int actual;
    actual = target.Add(a, b);
    Assert.AreEqual(expected, actual);
    Assert.Inconclusive("Verify the correctness of this test method.");
}

```

As you see, in a normal situation we would now fix these *TODO* items and have a unit test ready in no time. For this data driven test, let's first add a database to our project. Create column *a*, *b* and *expected*. These do not have to represent names in the unit test, but it's always more clear. Also, add some data.

![Data to test](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_8f9a61db-3eb9-4fba-a8b2-7ba8d8297c11.png)

![Test View](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_c0a8760e-f0ca-4dbb-acdb-a54d5ba259ce.png) Great, but how will our unit test use these values while running? Simply click the test to be bound to data, add the data source and table name properties. Next, read your data from the *TestContext.DataRow* property. The unit test will now look like this:

```csharp
/// <summary>
///A test for Add
///</summary>
[DataSource("System.Data.SqlServerCe.3.5", "data source=|DataDirectory|\\Database1.sdf", "CalculatorTestAdd", DataAccessMethod.Sequential), DeploymentItem("TestProject1\\Database1.sdf"), TestMethod()]
public void AddTest()
{
    Calculator target = new Calculator();
    int a = (int)TestContext.DataRow["a"];
    int b = (int)TestContext.DataRow["b"];
    int expected = (int)TestContext.DataRow["expected"];
    int actual;
    actual = target.Add(a, b);
    Assert.AreEqual(expected, actual);
}

```

Now run this newly created test. After the test run, you will see that the test is run a couple of times, one time for each data row in he database. You can also drill down further and check which values failed and which were succesful. If you do not want Visual Studio to use each data row sequential, you can also use the random accessor and really create a random data driven test.

![Test results](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part1_9A2E/image_6dab8bd3-dcb8-4f2f-b133-115cc46aab05.png)

Tomorrow, I'll try to do this with a web test and test our web interface. Stay tuned!
