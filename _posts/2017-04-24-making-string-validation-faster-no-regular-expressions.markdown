---
layout: post
title: "Making string validation faster by not using a regular expression. A story."
date: 2017-04-24 06:20:00 +0100
comments: true
published: true
categories: ["post"]
tags: ["General", "ICT", "CSharp", "Development", "Regular expressions"]
author: Maarten Balliauw
---

A while back, we were performance profiling an application and noticed a big performance bottleneck while mapping objects using [AutoMapper](https://www.automapper.org). Mapping is of course somewhat expensive, but the numbers we were seeing were way higher than expected: mapping was ridiculously slow! And "just mapping" was not a good explanation for these numbers. Trusting the work of [Jimmy](https://twitter.com/jbogard) and trusting AutoMapper, we expected something else was probably causing this. And it was: **a regular expression match was to blame!**

## The code was to blame

Actually not the regular expression itself, but the regular expression *and* the number of times it was called. While mapping, the target class' `Identifier` property was obviously being set, and validating the incoming value using a regular expression.

Not a super big deal in itself, except that while mapping this validation was executed for a few thousand objects, resulting in around one second (sometimes more) to map these objects. Not a happy place!

Here's the code that had the bottleneck:

```csharp
private string _identifier;

public string Identifier
{
    get
    {
        return _identifier;
    }
    set
    {
        if (Regex.IsMatch(value, "^[A-Za-z0-9@/._-]{1,254}$", RegexOptions.Compiled))
        {
            _identifier = value;
        }
        else
        {
            throw new InvalidPropertyValueException(nameof(Identifier), "The identifier is invalid.");
        }
    }
}
```

Aren't regular expressions, especially those with `RegexOptions.Compiled`, supposed to be super fast? And especially in this case, where we're only validating the string consists of a set of allowed characters, and making sure the string length is between 1 and 254 characters in length?

Some [DuckDuckGo](https://www.duckduckgo.com)-ing (horrible as a verb...) later, we found a few interesting articles:

* Back in 2005, [Jeff Atwood](https://blog.codinghorror.com/to-compile-or-not-to-compile/) wrote about using `RegexOptions.Compiled` and that it's not always the best thing to use. `RegexOptions.Compiled` emits IL code and precompiles the regular expression, but that comes with a bit of a startup cost. It's a tradeoff to make, and in our case we did expect this tradeoff to be one we could live with. Validation here happens quite a few times, so it makes sense to compile once and then reap the benefits later.
* We read the excellent MSDN article "[Best Practices for Regular Expressions in the .NET Framework](https://msdn.microsoft.com/en-us/library/gg578045(v=vs.110).aspx)", describing common pitfalls in working with regular expressions and performance considerations. Make sure to read it, this is a really nice article about the Regex engine in .NET.

Unfortunately, none of these seemed to explain the numbers we were seeing. And doing the math on the number of calls times regex execution time, the regex was actually fast enough, the number of calls was the big issue...

So how could we make this faster? Trial and error! We decided to try a couple of solutions to the problem and benchmark them. But before we benchmark: let's look at the solution candidates first.

## Candidates for improvement

To be able to compare results, we decided on a baseline for our benchmark. This baseline would be:

```csharp
Regex.IsMatch("Some.Sample-Data.To-Valid@te", "^[A-Za-z0-9@/._-]{1,254}$", RegexOptions.Compiled)
```

It is the same validation we found in production code, so let's see if we can improve from there.

### Candidate 1: don't use `RegexOptions.Compiled`

Given `RegexOptions.Compiled` is considered to not always be the best option, we decided to do a non-compiled version as part of the benchmark:

```csharp
Regex.IsMatch("Some.Sample-Data.To-Valid@te", "^[A-Za-z0-9@/._-]{1,254}$")
```

Our common sense told us this would not be better, but the only way to find out is by trying.

### Candidate 2: using a `Regex` instance

While MSDN told us that regular expressions are cached when using `Regex.IsMatch()` and others, we decided to also try another option: creating an instance of `Regex` and using that one. Or, in code, we'd create one instance:

```csharp
private static readonly Regex _precompiledRegex = new Regex("^[A-Za-z0-9@/._-]{1,254}$", RegexOptions.Compiled);
```

And then run the benchmark using:

```csharp
_precompiledRegex.IsMatch("Some.Sample-Data.To-Valid@te");
```

Who knows, this could be better than our baseline!

### Candidate 3: compiling the regular expression to an external assembly

This sounded interesting: instead of compiling the regular expression at run time, it's also possible to use `Regex.CompileToAssembly()` and create an assembly that hold the precompiled regular expression.

Unfortunately, doing this comes with a little bit of extra work: we have to compile the assembly first. This, in itself, isn't too hard, but it's having to do the extra step. But anyway, here's how:

```csharp
var compilations = new []
{
    new RegexCompilationInfo(
        pattern: @"^[A-Za-z0-9@/._-]{1,254}$",
        options: RegexOptions.Compiled,
        name: "ValidationPattern",
        fullnamespace: "RegexVsCode.Compiled",
        ispublic: true)
};
            
Regex.CompileToAssembly(compilations, 
    new AssemblyName("RegexVsCode.Compiled, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null"));
```

After running this, we can find a new assembly `RegexVsCode.Compiled.dll` in our `bin` folder, with a class `ValidationPattern` which holds our precompiled regular expression.

Always fascinated by the inner workings of things, I decided to open and decompile this generated assembly using [dotPeek](https://www.jetbrains.com/decompiler). Three classes seem to be generated:

![Decompiled regular expression in dotPeek](/images/2017/04/regex-decompiled.png)

A factory (used internally by the Regex engine), a `ValidationPattern` (as expected) and `ValidationPatternRunner1` - the class that holds the regular expression logic. Don't be scared, but this simple regex (again validating character classes + string length) does seem quite elaborate:

```csharp
    public override void Go()
    {
      string runtext = this.runtext;
      int runtextstart = this.runtextstart;
      int runtextbeg = this.runtextbeg;
      int runtextend = this.runtextend;
      int runtextpos = this.runtextpos;
      int[] runtrack = this.runtrack;
      int runtrackpos1 = this.runtrackpos;
      int[] runstack = this.runstack;
      int runstackpos = this.runstackpos;
      this.CheckTimeout();
      int num1;
      runtrack[num1 = runtrackpos1 - 1] = runtextpos;
      int num2;
      runtrack[num2 = num1 - 1] = 0;
      this.CheckTimeout();
      int num3;
      runstack[num3 = runstackpos - 1] = runtextpos;
      int num4;
      runtrack[num4 = num2 - 1] = 1;
      this.CheckTimeout();
      int end;
      if (runtextpos <= runtextbeg)
      {
        this.CheckTimeout();
        if (1 <= runtextend - runtextpos)
        {
          end = runtextpos + 1;
          int num5 = 1;
          while (RegexRunner.CharInClass(runtext[end - num5--], "\0\b\0-:@[_`a{"))
          {
            if (num5 <= 0)
            {
              this.CheckTimeout();
              int num6 = runtextend - end;
              int num7 = 253;
              if (num6 >= num7)
                num6 = 253;
              int num8 = num6;
              int num9 = 1;
              int num10 = num6 + num9;
              while (--num10 > 0)
              {
                if (!RegexRunner.CharInClass(runtext[end++], "\0\b\0-:@[_`a{"))
                {
                  --end;
                  break;
                }
              }
              if (num8 > num10)
              {
                int num11;
                runtrack[num11 = num4 - 1] = num8 - num10 - 1;
                int num12;
                runtrack[num12 = num11 - 1] = end - 1;
                runtrack[num4 = num12 - 1] = 2;
                goto label_13;
              }
              else
                goto label_13;
            }
          }
          goto label_16;
        }
        else
          goto label_16;
      }
      else
        goto label_16;
label_13:
      this.CheckTimeout();
      int num13;
      if (end >= runtextend - 1 && (end >= runtextend || (int) runtext[end] == 10))
      {
        this.CheckTimeout();
        int[] numArray = runstack;
        int index = num3;
        int num5 = 1;
        int num6 = index + num5;
        int start = numArray[index];
        this.Capture(0, start, end);
        int num7;
        runtrack[num7 = num4 - 1] = start;
        runtrack[num13 = num7 - 1] = 3;
      }
      else
        goto label_16;
label_15:
      this.CheckTimeout();
      this.runtextpos = end;
      return;
label_16:
      while (true)
      {
        this.runtrackpos = num4;
        this.runstackpos = num3;
        this.EnsureStorage();
        int runtrackpos2 = this.runtrackpos;
        num3 = this.runstackpos;
        runtrack = this.runtrack;
        runstack = this.runstack;
        int[] numArray = runtrack;
        int index = runtrackpos2;
        int num5 = 1;
        num4 = index + num5;
        switch (numArray[index])
        {
          case 1:
            this.CheckTimeout();
            ++num3;
            continue;
          case 2:
            goto label_19;
          case 3:
            this.CheckTimeout();
            runstack[--num3] = runtrack[num4++];
            this.Uncapture();
            continue;
          default:
            goto label_17;
        }
      }
label_17:
      this.CheckTimeout();
      int[] numArray1 = runtrack;
      int index1 = num4;
      int num14 = 1;
      num13 = index1 + num14;
      end = numArray1[index1];
      goto label_15;
label_19:
      this.CheckTimeout();
      int[] numArray2 = runtrack;
      int index2 = num4;
      int num15 = 1;
      int num16 = index2 + num15;
      end = numArray2[index2];
      int[] numArray3 = runtrack;
      int index3 = num16;
      int num17 = 1;
      num4 = index3 + num17;
      int num18 = numArray3[index3];
      if (num18 > 0)
      {
        int num5;
        runtrack[num5 = num4 - 1] = num18 - 1;
        int num6;
        runtrack[num6 = num5 - 1] = end - 1;
        runtrack[num4 = num6 - 1] = 2;
        goto label_13;
      }
      else
        goto label_13;
    }
```

There is not a lot of documentaton on this [`Go()`](https://docs.microsoft.com/en-us/dotnet/api/system.text.regularexpressions.regexrunner.go?view=netframework-4.7) method, but reading through it we can see a few things:

* It loops through the input string and checks various conditions
* It makes a number of cals to `this.CheckTimeout()`, to verify the current processor tick count against a configured timeout tick count (so there are a few side-tracks in this code)
* There are a few calls to `Capture()`and `Uncapture()`, the Regex-y stuff that keeps track of capture groups etc.

That's... a lot of code to power a simple validation. But nevertheless: it's all compiled, so performance may just be awesome!

### Candidate 4: Custom code

Having seen the compiled code from candidate 3, we decided on writing our own valiation code without using regular expressions. We want to validate the string consists of a set of allowed characters, and making sure the string length is between 1 and 254 characters in length. No backtracking, no capturing, no nothing which the regular expression engine provides us. Just a boolean giving us a clue on whether the value is valid or not.

Our code?

```csharp
private static bool Matches(string value)
{
    var len = value.Length;
    var matches = len >= 1 && len <= 254;

    if (matches)
    {
        for (int i = 0; i < len; i++)
        {
            matches = char.IsLetterOrDigit(value[i])
                      || value[i] == '@'
                      || value[i] == '/'
                      || value[i] == '.'
                      || value[i] == '_'
                      || value[i] == '-';

            if (!matches) return false;
        }
    }

    return matches;
} 
```

Simple, readable. If the length is not ok, just return false. In other cases, check each character and when one does not match, return false early without validating the rest of the string. Looks good, easy to read. Let's see how all candidates rank against each other...

## Running the benchmark

I'd heard about [BenchmarkDotNet](http://benchmarkdotnet.org) before, but never had a good reason to try until now. BenchmarkDotNet makes it incredibly easy to write benchmarks and get results in a structured way. Go check their [getting started with BenchmarkDotNet](http://benchmarkdotnet.org/GettingStarted.htm) page - it takes a couple of attributes and a method call to run a reliable benchmark.

### Our benchmark code

The benchmark we built was this one:

```csharp
public class RegexVsCodeBenchmark
{
    private static readonly Regex _precompiledRegex = new Regex("^[A-Za-z0-9@/._-]{1,254}$", RegexOptions.Compiled);
    private static readonly ValidationPattern _assemblyCompiledRegex = new ValidationPattern();

    private static bool Matches(string value)
    {
        var len = value.Length;
        var matches = len >= 1 && len <= 254;

        if (matches)
        {
            for (int i = 0; i < len; i++)
            {
                matches = char.IsLetterOrDigit(value[i])
                          || value[i] == '@'
                          || value[i] == '/'
                          || value[i] == '.'
                          || value[i] == '_'
                          || value[i] == '-';

                if (!matches) return false;
            }
        }

        return matches;
    } 

    [Benchmark(Description = "Regex.IsMatch - no options")]
    public bool RegexMatch()
    {
        return Regex.IsMatch("Some.Sample-Data.To-Valid@te", "^[A-Za-z0-9@/._-]{1,254}$");
    }

    [Benchmark(Baseline = true, Description = "Regex.IsMatch - with RegexOptions.Compiled")]
    public bool RegexCompiledMatch()
    {
        return Regex.IsMatch("Some.Sample-Data.To-Valid@te", "^[A-Za-z0-9@/._-]{1,254}$", RegexOptions.Compiled);
    }

    [Benchmark(Description = "Regex instance.IsMatch")]
    public bool RegexPrecompiledMatch()
    {
        return _precompiledRegex.IsMatch("Some.Sample-Data.To-Valid@te");
    }

    [Benchmark(Description = "Assembly-compiled Regex instance.IsMatch")]
    public bool RegexAssemblyCompiledMatch()
    {
        return _assemblyCompiledRegex.IsMatch("Some.Sample-Data.To-Valid@te");
    }

    [Benchmark(Description = "Custom code")]
    public bool CustomCodeMatch()
    {
        return Matches("Some.Sample-Data.To-Valid@te");
    }
}
```

We did a long run of this benchmark, to flatten out any compilation or optimization steps when starting the validations.

### The results!

The results of our benchmark, run on my laptop:

``` ini

BenchmarkDotNet=v0.10.3.0, OS=Microsoft Windows NT 6.2.9200.0
Processor=Intel(R) Core(TM) i7-4712HQ CPU 2.30GHz, ProcessorCount=8
Frequency=2240912 Hz, Resolution=446.2469 ns, Timer=TSC
  [Host]    : Clr 4.0.30319.42000, 32bit LegacyJIT-v4.6.1637.0
  Clr       : Clr 4.0.30319.42000, 32bit LegacyJIT-v4.6.1637.0
  LongRun   : Clr 4.0.30319.42000, 32bit LegacyJIT-v4.6.1637.0
  RyuJitX64 : Clr 4.0.30319.42000, 64bit RyuJIT-v4.6.1637.0

Runtime=Clr  

```
 |                                     Method |          Mean |     StdDev |        Median | Scaled |       Job |       Jit | Platform | LaunchCount | TargetCount | WarmupCount |
 |------------------------------------------- |-------------- |----------- |-------------- |------- |---------- |---------- |--------- |------------ |------------ |------------ |
 |                 Regex.IsMatch - no options | 1,226.8297 ns |  3.5225 ns | 1,227.3018 ns |   1.17 |       Clr | LegacyJit |      X86 |     Default |     Default |     Default |
 | Regex.IsMatch - with RegexOptions.Compiled | 1,047.4588 ns |  5.4065 ns | 1,047.4815 ns |   1.00 |       Clr | LegacyJit |      X86 |     Default |     Default |     Default |
 |                     Regex instance.IsMatch |   687.6756 ns |  3.2074 ns |   687.6606 ns |   0.66 |       Clr | LegacyJit |      X86 |     Default |     Default |     Default |
 |   Assembly-compiled Regex instance.IsMatch |   678.6101 ns |  3.1376 ns |   679.1363 ns |   0.65 |       Clr | LegacyJit |      X86 |     Default |     Default |     Default |
 |                                Custom code |   232.7207 ns |  1.5766 ns |   233.4604 ns |   0.22 |       Clr | LegacyJit |      X86 |     Default |     Default |     Default |
 |                 Regex.IsMatch - no options | 1,223.2374 ns | 13.3485 ns | 1,224.9534 ns |   1.17 |   LongRun | LegacyJit |      X86 |           3 |         100 |          15 |
 | Regex.IsMatch - with RegexOptions.Compiled | 1,046.5155 ns |  8.4462 ns | 1,046.1358 ns |   1.00 |   LongRun | LegacyJit |      X86 |           3 |         100 |          15 |
 |                     Regex instance.IsMatch |   691.9244 ns | 16.1136 ns |   687.4307 ns |   0.66 |   LongRun | LegacyJit |      X86 |           3 |         100 |          15 |
 |   Assembly-compiled Regex instance.IsMatch |   679.6252 ns |  8.4723 ns |   678.1218 ns |   0.65 |   LongRun | LegacyJit |      X86 |           3 |         100 |          15 |
 |                                Custom code |   222.1603 ns |  2.4627 ns |   221.7280 ns |   0.21 |   LongRun | LegacyJit |      X86 |           3 |         100 |          15 |
 |                 Regex.IsMatch - no options | 1,264.0441 ns | 20.6973 ns | 1,269.0945 ns |   1.26 | RyuJitX64 |    RyuJit |      X64 |     Default |     Default |     Default |
 | Regex.IsMatch - with RegexOptions.Compiled | 1,001.7433 ns | 17.6897 ns | 1,003.1064 ns |   1.00 | RyuJitX64 |    RyuJit |      X64 |     Default |     Default |     Default |
 |                     Regex instance.IsMatch |   626.9669 ns |  2.7593 ns |   626.6262 ns |   0.63 | RyuJitX64 |    RyuJit |      X64 |     Default |     Default |     Default |
 |   Assembly-compiled Regex instance.IsMatch |   623.4043 ns |  3.1937 ns |   622.1284 ns |   0.62 | RyuJitX64 |    RyuJit |      X64 |     Default |     Default |     Default |
 |                                Custom code |   168.9835 ns |  0.9644 ns |   168.8081 ns |   0.17 | RyuJitX64 |    RyuJit |      X64 |     Default |     Default |     Default |

First of all, there is no real difference between JIT versions. We sort of expected that but still wanted to see if there were any big changes in selecting the JIT version.

There *are* big differences in our different candidates, though. From slow to fast:

* Candidate 1, `Regex.IsMatch` (not using `RegexOptions.Compiled`) is clearly slowest. We expected this but still wanted to try.
* The baseline, `Regex.IsMatch` (using `RegexOptions.Compiled`) isn't significantly faster. It is faster, but the improvement is not spectacular.
* Candidate 2, using an instance, only takes 60% of the time our baseline takes. That's significantly faster, and would be a good improvement in our codebase.
* Candidate 3, using a regular expression compiled into an external assembly, is only *slightly* faster than candidate 2. The difference could be in the startup time (where candidate 2 still has to be compiled at runtime), but we did not measure.
* Candidate 4, our custom code, seems to outperform all others. Our focused piece of code runs in 17% of the time the baseline took to run. That's a massive improvement!

Based on these result, our custom validation logic was added into production code and proved much, much faster!

## Conclusion

Based on this post, you may think regular expressions are bad. In reality, they are not. They do seem to come with some considerations to make and some pitfalls you may encounter (see the articles linked higher up in this post), but they are great.

In the case at hand, though, custom code was the better path:

* The validation logic was simple, and writing it in code is still very readable
* We did not need capturing and all other features regular expressions give us

So then what *is* the takeaway for this post? I'd say there are two:

* Always be measuring. Use [a profiler](https://www.jetbrains.com/dottrace) and regularly measure different code paths in an application. If anything looks out of expected ranges, look at how it can be improved.
* Use regular expressions! Just not for validating string length.

Enjoy!