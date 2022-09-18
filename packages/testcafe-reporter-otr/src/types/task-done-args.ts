import * as t from 'io-ts';

export const TaskResultSchema = t.readonly(
    t.exact(
        t.type({
            failedCount:  t.number,
            passedCount:  t.number,
            skippedCount: t.number
        })
    )
);

export type TaskResult = t.TypeOf<typeof TaskResultSchema>;

