export default function () {
    return {
        calls: [],

        _push: function (call) {
            this.write(`${call.methodName}(...)`)
            this.newline()
            this.calls.push(JSON.stringify(call, null, 2));
        },
        reportTaskStart(startTime, userAgents, testCount, ..._rest) {
            this._push({
                methodName: 'reportTaskStart',
                arguments: {
                    startTime,
                    userAgents,
                    testCount
                },
                // contains objects with cyclic references that can not be stringified with JSON
                //additionalArguments: rest
            });
        },

        reportFixtureStart(name, path, meta, ...rest) {
            this._push({
                methodName: 'reportFixtureStart',
                arguments: {
                    name,
                    path,
                    meta
                },
                additionalArguments: rest
            });
        },

        reportTestStart(name, meta, testStartInfo, ...rest) {
            this._push({
                methodName: 'reportTestStart',
                arguments: {
                    name,
                    meta,
                    testStartInfo
                },
                additionalArguments: rest
            });
        },

        reportTestActionStart(apiActionName, actionInfo, ...rest) {
            this._push({
                methodName: 'reportTestActionStart',
                arguments: {
                    apiActionName,
                    actionInfo
                },
                additionalArguments: rest
            })
        },

        reportTestActionDone(apiActionName, actionInfo, ...rest) {
            this._push({
                methodName: 'reportTestActionDone',
                arguments: {
                    apiActionName,
                    actionInfo
                },
                additionalArguments: rest
            })
        },

        reportTestDone(name, testRunInfo, meta, ...rest) {
            this._push({
                methodName: 'reportTestDone',
                arguments: {
                    name,
                    testRunInfo,
                    meta
                },
                additionalArguments: rest
            });
        },

        reportWarnings(warning, ...rest) {
            this._push({
                methodName: 'reportWarnings',
                arguments: {
                    warning
                },
                additionalArguments: rest
            });
        },

        reportTaskDone(endTime, passed, warnings, result, ...rest) {
            this._push({
                methodName: 'reportTaskDone',
                arguments: {
                    endTime,
                    passed,
                    warnings,
                    result
                },
                additionalArguments: rest
            });
            this.write(this.calls.join('\n'));
            this.newline();
        }
    };
}
