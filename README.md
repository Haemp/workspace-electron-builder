# Bug Report
This repo is for illustrating a bug relating to yarn workspaces and electron-builder. Note the two different versions of chalk that is being used.

## Test
1. First run `yarn install` in the root folder
    - Make sure you have workspaces enabled and working.
2. What you should see
    1. We have a yarn workspace with two packages
        - electron-app
        - package
    2. The electron-app package is the root for our electron app
         - Electron-app is using package as part of its dependencies.
         - Electron-app is also using a new version of **chalk@2.4.1**
    3. The package dependency
        - Is using an old version of **chalk@1.3.3**

3. Now we run the build using `yarn run build` inside the electron-app folder
    - We expect both versions of the chalk library to be present in the packaged app folder

## Actual Outcome
When we inspect the output of the packaged app `Resources/app/node_modules` we only see chalk@1.3.3. The version 2.4.1 is completely missing. But there is a clue to why this is happening: In node_modules/chalk we see templates.js - a file that only exists in chalk@2.4.1.

## What actually happens
After some investigation I've narrowed it down to somewhere inside the app copy logic.

From looking at the appFileCopier.ts we can see that inside the computeNodeModuleFileSets function we first get the node-deps-tree from the app-builder. This returns two directories along with their deps.
```
[
    {
        "dir": "/Users/username/projects/workspace-electron-builder/node_modules",
        "deps": [
            "ansi-regex",
            "ansi-styles",
            "chalk",
            "color-convert",
            "color-name",
            "escape-string-regexp",
            "has-ansi",
            "has-flag",
            "package",
            "strip-ansi",
            "supports-color"
        ]
    },
    {
        "dir": "/Users/username/projects/workspace-electron-builder/node_modules/package/node_modules",
        "deps": [
            "ansi-styles",
            "chalk",
            "supports-color"
        ]
    }
]
```
This looks about right - one is the workspace-root with all the hoisted node_modules and one is the package node_modules. Note that we have two different version of chalk here.

Next we go on to set the destination for these modules
Our first path is: `"/Users/username/projects/workspace-electron-builder/node_modules"`

The crucial part is the line at appFileCopier.ts:200: Note that in our case the if condition fails and the else part is executed. This leaves us with a copy rule of
- workspace-electron-builder/node_modules -> app/node_modules

Seems alright, just copy all the hoisted modules to the root of the app.

Now this is where our bug happens. We hit line 200 with this dependency:  `"/Users/username/projects/workspace-electron-builder/node_modules/package/node_modules"`

This time we also fail the if statement and gets our destination set to app/node_modules. Now we end up with a copy rule of
- workspace-electron-builder/node_modules/package/node_modules -> app/node_modules

That is NOT right. This means we will merge the package/node_modules with all the other modules inside the app/node_modules.

Since package has chalk as a dependency it will merge the node_modules and create a type of frankenstein chalk with some of the 2.4.1 files and some of the 1.3.3 files.