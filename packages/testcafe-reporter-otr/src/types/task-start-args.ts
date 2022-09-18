import * as t from 'io-ts';
import { NameSchema, ShortIdSchema } from './common';

export const ReportedTestItemSchema = t.readonly(
    t.exact(
        t.type({
            id:   ShortIdSchema,
            name: NameSchema,
            skip: t.boolean
        })
    )
);

export const ReportedFixtureItemSchema = t.readonly(
    t.exact(
        t.type({
            id:    NameSchema,
            name:  NameSchema,
            tests: t.array(ReportedTestItemSchema)
        })
    )
);

const ReportedTestStructureItemSchema = t.readonly(
    t.exact(
        t.type({
            fixture: ReportedFixtureItemSchema
        })
    )
);

export type ReportedTestStructureItem = t.TypeOf<typeof ReportedTestStructureItemSchema>



