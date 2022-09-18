import { ReporterPluginObject } from './types/internal';


const noop = () => Promise.resolve();

const BLANK_REPORTER: ReporterPluginObject = {
    init:                 noop,
    reportTaskStart:      noop,
    reportFixtureStart:   noop,
    reportTestDone:       noop,
    reportTaskDone:       noop,
    reportWarnings:       noop,
    createErrorDecorator: () => ({}),
    getReportUrl:         () => ''
};

module.exports = function pluginFactory (): ReporterPluginObject {
    return BLANK_REPORTER
};
