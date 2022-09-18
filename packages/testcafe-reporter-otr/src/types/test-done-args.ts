
import * as t from 'io-ts';
import { ShortIdSchema } from './common';
t.readonly(
    t.exact(
        t.type({
            testId:     ShortIdSchema,
            skipped:    t.boolean,
            errorCount: t.number,
            duration:   t.number,
            unstable:   t.union([t.boolean, t.undefined]),
            uploadId:   t.union([t.string, t.undefined])
        })
    )
);
