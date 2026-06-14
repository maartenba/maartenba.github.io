---
layout: post
title: "Data Driven Testing in Visual Studio 2008 - Part 2"
pubDatetime: 2008-02-13T17:30:00Z
comments: true
published: true
categories: ["post"]
tags: ["ASP.NET", "CSharp", "Debugging", "General", "Testing"]
author: Maarten Balliauw
redirect_from:
  - /post/2008/02/13/data-driven-testing-in-visual-studio-2008-part-2.html
---
This is the second post in my series on Data Driven Testing in Visual Studio 2008. The first post focusses on Data Driven Testing in regular Unit Tests. This part will focus on the same in web testing.

- [Data Driven Testing in Visual Studio 2008 - Part 1 - Unit testing](/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx)
- [Data Driven Testing in Visual Studio 2008 - Part 2 - Web testing](/post/2008/02/data-driven-testing-in-visual-studio-2008---part-2.aspx)

## Web Testing

I assume you have read my [previous post](/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx) and saw the cool user interface I created. Let's first add some code to that, focussing on the *TextBox_TextChanged* event handler that is linked to *TextBox1* and *TextBox2*.

```csharp
public partial class _Default : System.Web.UI.Page
{
    // ... other code ...
    protected void TextBox_TextChanged(object sender, EventArgs e)
    {
        if (!string.IsNullOrEmpty(TextBox1.Text.Trim()) && !string.IsNullOrEmpty(TextBox2.Text.Trim()))
        {
            int a;
            int b;
            int.TryParse(TextBox1.Text.Trim(), out a);
            int.TryParse(TextBox2.Text.Trim(), out b);
            Calculator calc = new Calculator();
            TextBox3.Text = calc.Add(a, b).ToString();
        }
        else
        {
            TextBox3.Text = "";
        }
    }
}

```

It is now easy to run this in a browser and play with it. You'll notice 1 + 1 equals 2, otherwise you copy-pasted the wrong code. You can now create a web test for this. Right-click the test project, "Add", "Web Test...". If everything works well your browser is now started with a giant toolbar named "Web Test Recorder" on the left. This toolbar will record a macro of what you are doing, so let's simply navigate to the web application we created, enter some numbers and whatch the calculation engine do the rest:

![Web Test Recorder](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_5cda2c08-cd62-402f-afc2-45078716179b.png)

You'll notice an entry on the left for each request that is being fired. When the result is shown, click "Stop" and let Visual Studio determine what happened behind the curtains of your browser. An overview of this test recording session should now be available in Visual Studio.

## Data Driven Web testing

There's our web test! But it's not data driven yet... First thing to do is linking the database we created in [part 1](/post/2008/02/data-driven-testing-in-visual-studio-2008---part-1.aspx) by clicking the "![Add datasource](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_bcfa582e-41f3-49f2-9168-926d5981bed1.png)  Add Datasource" button. Finish the wizard by selecting the database and the correct table. Afterwards, you can pick one of the Form Post Parameters and assign the value from our newly added datasource. Do this for each step in our test: the first step should fill TextBox1, the second should fill TextBox1 and TextBox2.

![Bind Form Post Parameters](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_b1a618a0-1642-4b2e-85fd-4a0997f272b8.png)

In the last recorded step of our web test, add a validation rule. We want to check whether our sum is calculated correct and is shown in TextBox3. Pick the following options in the "Add Validation Rule" screen. For the "Expected Value" property, enter the variable name which comes from our data source: *{{DataSource1.CalculatorTestAdd.expected}}*

![image](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_310d467e-7d40-4305-bef4-27b69fef2276.png)

If you now run the test, you should see success all over the place! But there's one last step to do though... Visual Studio 2008 will only run this test for the first data row, not for all other rows! To overcome this poblem, select "Run Test (Pause Before Starting" instead of just "Run Test". You'll notice the following hyperlink in the IDE interface:

![Edit Run Settings](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_a6c86775-2e84-4b62-9eba-593276c9fa92.png)

Click "Edit run Settings" and pick "One run per data source row". There you go! Multiple test runs are now validated ans should result in an almost green-bulleted screen:

![image](/images/WindowsLiveWriter/DataDrivenTestinginVisualStudio2008Part2_A33C/image_72aff225-1033-4c81-be6c-f9ede3e1fade.png)
