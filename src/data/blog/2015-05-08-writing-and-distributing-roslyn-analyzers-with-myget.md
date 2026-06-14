---
layout: post
title: "Writing and distributing Roslyn analyzers with MyGet"
pubDatetime: 2015-05-08T09:35:13Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "General", "Projects", "Software"]
author: Maarten Balliauw
redirect_from:
  - /post/2015/05/08/writing-and-distributing-roslyn-analyzers-with-myget.html
---
Pretty sweet: [MyGet just announced Vsix support](http://www.myget.org/vsix) has been enabled for all MyGet customers! I wanted to work on a fun example for this new feature and came up with this: how can we use MyGet to build and distribute a Roslyn analyzer and code fix? Let’s see.


## Developing a Roslyn analyzer and code fix


Roslyn analyzers and code fixes allow development teams and individuals to enforce certain rules within a code base. Using code fixes, it’s also possible to provide automated “fixes” for issues found in code. When writing code that utilizes *DateTime*, it’s often best to use *DateTime.UtcNow* instead of *DateTime.Now*. The first uses UTC timezone, while the latter uses the local time zone of the computer the code runs on, often introducing nasty time-related bugs. Let’s write an analyzer that detects usage of *DateTime.Now*!


You will need [Visual Studio 2015 RC](https://www.visualstudio.com/en-us/downloads/visual-studio-2015-downloads-vs.aspx) and the [Visual Studio 2015 RC SDK](http://go.microsoft.com/?linkid=9877247) installed. You’ll also need the [SDK Templates VSIX package](https://visualstudiogallery.msdn.microsoft.com/e2e07e91-9d0b-4944-ba40-e86bcbec1599) to get the Visual Studio project templates. Once you have those, we can create a new *Analyzer with Code Fix*.


[![](/images/image_thumb%5B2%5D_thumb.png)](/images/image_thumb%5B2%5D.png)


A solution with 3 projects will be created: the analyzer and code fix, unit tests and a Vsix project. Let’s start with the first: detecting *DateTime.Now* in code an showing a diagnostic for it. It’s actually quite easy to do: we tell Roslyn we want to analyze *IdentifierName* nodes and it will pass them to our code. We can then see if the identifier is “Now” and the parent node is “System.DateTime”. If that’s the case, return a diagnostic:


```csharp
private void AnalyzeIdentifierName(SyntaxNodeAnalysisContext context)
{
    var identifierName = context.Node as IdentifierNameSyntax;
    if (identifierName != null)
    {
        // Find usages of "DateTime.Now"
        if (identifierName.Identifier.ValueText == "Now")
        {
            var expression = ((MemberAccessExpressionSyntax)identifierName.Parent).Expression;
            var memberSymbol = context.SemanticModel.GetSymbolInfo(expression).Symbol;

            if (!memberSymbol?.ToString().StartsWith("System.DateTime") ?? true)
            {
                return;
            }
            else
            {
                // Produce a diagnostic.
                var diagnostic = Diagnostic.Create(Rule, identifierName.Identifier.GetLocation(), identifierName);

                context.ReportDiagnostic(diagnostic);
            }
        }
    }
}

```

If we compile our solution and add the generated NuGet package to another project, *DateTime.Now* code will be flagged. But let’s implement the code fix first as well. We want to provide a code fix for the syntax node we just detected. And when we invoke it, we want to replace the “Now” node with “UtcNow”. A bit of Roslyn syntax tree fiddling:

    public sealed override async Task RegisterCodeFixesAsync(CodeFixContext context)
    {
        var root = await context.Document.GetSyntaxRootAsync(context.CancellationToken).ConfigureAwait(false);

        var diagnostic = context.Diagnostics.First();
        var diagnosticSpan = diagnostic.Location.SourceSpan;

        // Find "Now"
        var identifierNode = root.FindNode(diagnosticSpan);

        // Register a code action that will invoke the fix.
        context.RegisterCodeFix(
            CodeAction.Create("Replace with DateTime.UtcNow", c => ReplaceWithDateTimeUtcNow(context.Document, identifierNode, c)),
            diagnostic);
    }

    private async Task<Document> ReplaceWithDateTimeUtcNow(Document document, SyntaxNode identifierNode, CancellationToken cancellationToken)
    {
        var root = await document.GetSyntaxRootAsync(cancellationToken);
        var newRoot = root.ReplaceNode(identifierNode, SyntaxFactory.IdentifierName("UtcNow"));
        return document.WithSyntaxRoot(newRoot);
    }</pre>

That’s it. We now have an analyzer and a code fix. If we try it (again, by adding the generated NuGet package to another project), we can see both in action:

[![](/images/image_thumb%5B6%5D_thumb.png)](/images/image_thumb%5B6%5D.png)

Now let’s distribute it to our team!

## Distributing a Roslyn analyzer and code fix using MyGet

Roslyn analyzers can be distributed in two formats: as NuGet packages, so they can be enabled for individual project, and as a Visual Studio extension so that all projects we work with have the analyzer and code fix enabled. You can build on a developer machine, a CI server or using [MyGet Build Services](http://docs.myget.org/docs/reference/build-services). Let’s pick the latter as it’s the easiest way to achieve our goal: compile and distribute.

Create a new feed on [www.myget.org](http://www.myget.org). Next, from the *Build Services* tab, we can add a GitHub repository as the source. We’ve open-sourced our example at [https://github.com/myget/sample-roslyn-with-vsix](https://github.com/myget/sample-roslyn-with-vsix) so feel free to add it to your feed as a test. Once added, you can start a build. Just like that. MyGet will figure out it’s a Roslyn analyzer and build both the NuGet package as well as the Visual Studio extension.

[![](/images/image_thumb%5B9%5D_thumb.png)](/images/image_thumb%5B9%5D.png)

Sweet! You can now add the Roslyn analyzer and code fix per-project, by installing the NuGet package from the feed ([https://www.myget.org/F/datetime-analyzer/api/v2](https://www.myget.org/F/datetime-analyzer/api/v2)). ANd when registering it in Visual Studio ([https://www.myget.org/F/datetime-analyzer/vsix/](https://www.myget.org/F/datetime-analyzer/vsix/)) by opening the *Tools | Options...* menu and the *Environment | Extensions and Updates* pane, you can also install the full extension.

[![](/images/image_thumb%5B12%5D_thumb.png)](/images/image_thumb%5B12%5D.png)
