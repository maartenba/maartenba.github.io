---
layout: post
title: "Running unit tests when deploying to Windows Azure Web Sites"
pubDatetime: 2013-01-30T10:18:56Z
comments: true
published: true
categories: ["post"]
tags: ["CSharp", "ASP.NET", "General", "PHP", "Azure"]
author: Maarten Balliauw
redirect_from:
  - /post/2013/01/30/running-unit-tests-when-deploying-to-windows-azure-web-sites.html
---
When deploying an application to Windows Azure Web Sites, a number of deployment steps are executed. For .NET projects, msbuild is triggered. For node.js applications, a list of dependencies is restored. For PHP applications, files are copied from source control to the actual web root which is served publicly. Wouldn’t it be cool if Windows Azure Web Sites refused to deploy fresh source code whenever unit tests fail? In this post, I’ll show you how.


<u>Disclaimer:</u>  I’m using PHP and PHPUnit here but the same approach can be used for node.js. .NET is a bit harder since most test runners out there are not supported by the Windows Azure Web Sites sandbox. I’m confident however that in the near future this issue will be resolved and the same technique can be used for .NET applications.


## Our sample application


First of all, let’s create a simple application. Here’s a very simple one using the [Silex](http://silex.sensiolabs.org/) framework which is similar to frameworks like [Sinatra](http://www.sinatrarb.com/) and [Nancy](http://www.nancyfx.org/).


```php
<?php
require_once(__DIR__ . '/../vendor/autoload.php');

$app = new \Silex\Application();

$app->get('/', function (\Silex\Application $app)  {
    return 'Hello, world!';
});

$app->run();

```

Next, we can create some unit tests for this application. Since our app itself isn’t that massive to test, let’s create some dummy tests instead:

```php
<?php
namespace Jb\Tests;

class SampleTest
    extends \PHPUnit_Framework_TestCase {

    public function testFoo() {
        $this->assertTrue(true);
    }

    public function testBar() {
        $this->assertTrue(true);
    }

    public function testBar2() {
        $this->assertTrue(true);
    }
}

```

As we can see from our IDE, the three unit tests run perfectly fine.

[![](/images/image_thumb_216.png)](/images/image_254.png)

Now let’s see if we can hook them up to Windows Azure Web Sites…

## Creating a Windows Azure Web Sites deployment script

Windows Azure Web Sites allows us to customize deployment. Using the [azure-cli](http://www.windowsazure.com/en-us/manage/linux/other-resources/command-line-tools/) tools we can issue the following command:

```

azure site deploymentscript

```

As you can see from the following screenshot, this command allows us to specify some additional options, such as specifying the project type (ASP.NET, PHP, node.js, …) or the script type (batch or bash).

[![](/images/image_thumb_217.png)](/images/image_255.png)

Running this command does two things: it creates a *.deployment *file which tells Windows Azure Web Sites which command should be run during the deployment process and a *deploy.cmd* (or *deploy.sh* if you’ve opted for a bash script) which contains the entire deployment process. Let’s first look at the *.deployment* file:

```

[config]
command = bash deploy.sh

```

This is a very simple file which tells Windows Azure Web Sites to invoke the *deploy.sh* script using *bash* as the shell. The default *deploy.sh* will look like this:

```php
#!/bin/bash

# ----------------------

# KUDU Deployment Script

# ----------------------

# Helpers

# -------

exitWithMessageOnError () {
  if [ ! $? -eq 0 ]; then
    echo "An error has occured during web site deployment."
    echo $1
    exit 1
  fi
}

# Prerequisites

# -------------

# Verify node.js installed

where node &> /dev/null
exitWithMessageOnError "Missing node.js executable, please install node.js, if already installed make sure it can be reached from current environment."

# Setup

# -----

SCRIPT_DIR="$( cd -P "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ARTIFACTS=$SCRIPT_DIR/artifacts

if [[ ! -n "$DEPLOYMENT_SOURCE" ]]; then
  DEPLOYMENT_SOURCE=$SCRIPT_DIR
fi

if [[ ! -n "$NEXT_MANIFEST_PATH" ]]; then
  NEXT_MANIFEST_PATH=$ARTIFACTS/manifest

  if [[ ! -n "$PREVIOUS_MANIFEST_PATH" ]]; then
    PREVIOUS_MANIFEST_PATH=$NEXT_MANIFEST_PATH
  fi
fi

if [[ ! -n "$KUDU_SYNC_COMMAND" ]]; then
  # Install kudu sync

  echo Installing Kudu Sync
  npm install kudusync -g --silent
  exitWithMessageOnError "npm failed"

  KUDU_SYNC_COMMAND="kuduSync"
fi

if [[ ! -n "$DEPLOYMENT_TARGET" ]]; then
  DEPLOYMENT_TARGET=$ARTIFACTS/wwwroot
else
  # In case we are running on kudu service this is the correct location of kuduSync

  KUDU_SYNC_COMMAND="$APPDATA\\npm\\node_modules\\kuduSync\\bin\\kuduSync"
fi

##################################################################################################################################

# Deployment

# ----------

echo Handling Basic Web Site deployment.

# 1. KuduSync

echo Kudu Sync from "$DEPLOYMENT_SOURCE" to "$DEPLOYMENT_TARGET"
$KUDU_SYNC_COMMAND -q -f "$DEPLOYMENT_SOURCE" -t "$DEPLOYMENT_TARGET" -n "$NEXT_MANIFEST_PATH" -p "$PREVIOUS_MANIFEST_PATH" -i ".git;.deployment;deploy.sh"
exitWithMessageOnError "Kudu Sync failed"

##################################################################################################################################

echo "Finished successfully."

```

This script does two things: setup a bunch of environment variables so our script has all the paths to the source code repository, the target web site root and some well-known commands, Next, it runs the *[KuduSync](https://github.com/projectkudu/KuduSync)* executable, a helper which copies files from the source code repository to the web site root using an optimized algorithm which only copies files that have been modified. For .NET, there would be a third action which is done: running msbuild to compile sources into binaries.

Right before the part that reads* # Deployment*, we can add some additional steps for running unit tests. We can invoke the *php.exe* executable (located on the D:\ drive in Windows Azure Web Sites) and run *phpunit.php* passing in the path to the test configuration file:

```php
##################################################################################################################################

# Testing

# -------

echo Running PHPUnit tests.

# 1. PHPUnit

"D:\Program Files (x86)\PHP\v5.4\php.exe" -d auto_prepend_file="$DEPLOYMENT_SOURCE\\vendor\\autoload.php" "$DEPLOYMENT_SOURCE\\vendor\\phpunit\\phpunit\\phpunit.php" --configuration "$DEPLOYMENT_SOURCE\\app\\phpunit.xml"
exitWithMessageOnError "PHPUnit tests failed"
echo

```

On a side note, we can also run other commands like issuing a *composer update*, similar to NuGet package restore in the .NET world:

```php
echo Download composer.
curl -O https://getcomposer.org/composer.phar > /dev/null

echo Run composer update.
cd "$DEPLOYMENT_SOURCE"
"D:\Program Files (x86)\PHP\v5.4\php.exe" composer.phar update --optimize-autoloader

```

## Putting our deployment script to the test

All that’s left to do now is commit and push our changes to Windows Azure Web Sites. If everything goes right, the output for the *git push* command should contain details of running our unit tests:

[![](/images/image_thumb_218.png)](/images/image_256.png)

Here’s what happens when a test fails:

[![](/images/image_thumb_219.png)](/images/image_257.png)

And even better, the Windows Azure Web Sites portal shows us that the latest sources were commited to the git repository but not deployed because tests failed:

[![](/images/image_thumb_220.png)](/images/image_258.png)

As you can see, using deployment scripts we can customize deployment on Windows Azure Web Sites to fit our needs. We can run unit tests, fetch source code from a different location and so on. Enjoy!
