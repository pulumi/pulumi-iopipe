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
    pulumi.runtime.serializeFunction = async function(func, args) {
        const wrapper = () => {
            return () => require("@iopipe/iopipe")({token})(func);
        }

        const serialized = await origSerializeFunction(wrapper, {...args, isFactoryFunction: true});        
        return serialized;
    };
    const originComputeCodePaths = pulumi.runtime.computeCodePaths;
    pulumi.runtime.computeCodePaths = async function(extraIncludePaths, extraIncludePackages, extraExcludePackages){
        // Make sure that `@iopipe/iopipe` is included in the uploaded package.
        const newExtraIncludePackages = [...(extraIncludePackages || []), "@iopipe/iopipe"];
        return originComputeCodePaths(extraIncludePaths, newExtraIncludePackages, extraExcludePackages);
    };
}

// Attempt to install to the version of Pulumi we loaded
install(pulumi);

module.exports = install;

