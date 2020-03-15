﻿using System;
using System.IO;
using System.Linq;
using SimpleExec;
using static Bullseye.Targets;
using static SimpleExec.Command;

namespace build
{
    class Program
    {
        private const string ArtifactsDir = "artifacts";
        private const string DotnetBuild = "dotnetbuild";
        private const string YarnBuild = "yarnbuild";
        private const string DotnetTest = "dotnettest";
        private const string YarnTest = "yarntest";
        private const string Pack = "pack";
        private const string Publish = "publish";
        private static bool s_oneOrMoreTestsFailed;

        private static void Main(string[] args)
        {
            Target(DotnetBuild, () => Run("dotnet", "build --configuration=Release"));

            Target(YarnBuild, () => Run("yarn", "--cwd ./src/sqlstreamstore.ui build"));

            Target(
                DotnetTest,
                DependsOn(DotnetBuild),
                ForEach(    
                    "SqlStreamStore.Browser.Tests"
                ), 
                project =>
                {
                    try
                    {
                        Run("dotnet",
                            $"test src/{project}/{project}.csproj --configuration=Release --no-build --no-restore --verbosity=normal");
                    }
                    catch (NonZeroExitCodeException)
                    {
                        s_oneOrMoreTestsFailed = true;
                    }
                });
            
            Target(
                YarnTest,
                DependsOn(YarnBuild),
                () => {
                    try {
                        Run("yarn", "--cwd ./src/sqlstreamstore.ui test --watchAll=false");
                    }
                    catch (NonZeroExitCodeException)
                    {
                        s_oneOrMoreTestsFailed = true;
                    }
                }
            );

            Target(
                Pack,
                DependsOn(YarnTest, DotnetTest),
                ForEach(
                    "SqlStreamStore.Browser"
                ),
                project => Run("dotnet", $"pack src/{project}/{project}.csproj -c Release -o ./{ArtifactsDir} --no-build"));

            // Target(Publish, DependsOn(Pack), () =>
            // {
            //     var packagesToPush = Directory.GetFiles($"../{ArtifactsDir}", "*.nupkg", SearchOption.TopDirectoryOnly);
            //     Console.WriteLine($"Found packages to publish: {string.Join("; ", packagesToPush)}");

            //     var apiKey = Environment.GetEnvironmentVariable("FEEDZ_SSS_API_KEY");

            //     if (string.IsNullOrWhiteSpace(apiKey))
            //     {
            //         Console.WriteLine("Feedz API key not available. Packages will not be pushed.");
            //         return;
            //     }

            //     foreach (var packageToPush in packagesToPush)
            //     {
            //         Run("dotnet", $"nuget push {packageToPush} -s https://f.feedz.io/logicality/streamstore-ci/nuget/index.json -k {apiKey} --skip-duplicate", noEcho: true);
            //     }
            // });

            Target("default",
                // DependsOn(Test, Publish),
                DependsOn(Pack),
                () =>
                {
                    if (s_oneOrMoreTestsFailed)
                    {
                        throw new Exception("One or more tests failed.");
                    }
                });

            RunTargetsAndExit(args);
        }
    }
}
