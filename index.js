// Copyright 2016-2018, Pulumi Corporation.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const pulumi = require("@pulumi/pulumi");

// Require an `iopipe:token` to be provided by the end-user.
const config = new pulumi.Config("iopipe");
const token = config.require("token")

// Replace `pulumi.runtime.serializeFunction` and `pulumi.runtime.computeCodePaths` with wrappers which injects IO|Pipe
// around all serialized Pulumi functions.
function install(pulumi) {
    const origSerializeFunction = pulumi.runtime.serializeFunction;
    pulumi.runtime.serializeFunction = function (func, args) {
        const wrapper =
            args.isFactoryFunction
            ? () => require("@iopipe/iopipe")({ token })(func())
            : () => require("@iopipe/iopipe")({ token })(func);
        return origSerializeFunction(wrapper, { ...args, isFactoryFunction: true });
    };
    const originComputeCodePaths = pulumi.runtime.computeCodePaths;

    pulumi.runtime.computeCodePaths =
    function (optionsOrExtraIncludePaths, extraIncludePackages, extraExcludePackages) {
        let options;
        if (Array.isArray(optionsOrExtraIncludePaths)) {
            options = {
                extraIncludePaths: optionsOrExtraIncludePaths,
                extraIncludePackages,
                extraExcludePackages,
            };
        }
        else
        {
            options = optionsOrExtraIncludePaths || {};
        }

        // Make sure that `@iopipe/iopipe` is included in the uploaded package.
        options.extraIncludePackages = options.extraIncludePackages || [];
        options.extraIncludePackages.push("@iopipe/iopipe");

        return originComputeCodePaths(options);
    };
}

// Attempt to install to the version of Pulumi we loaded
install(pulumi);

module.exports = install;

