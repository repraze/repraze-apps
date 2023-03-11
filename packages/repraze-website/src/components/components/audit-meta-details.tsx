import {Control, Field} from "@repraze/lib-ui/components/form/field/field";
import {Label} from "@repraze/lib-ui/components/form/label/label";
import {Grid, GridCell} from "@repraze/lib-ui/layout/grid/grid";
import {Meta} from "@repraze/website-lib/types/meta";
import React from "react";

import {dateTimestampFormat} from "../../lib/utils/date-format";

export interface AuditMetaDetailsProps {
    document: Meta;
}

export function AuditMetaDetails({document}: AuditMetaDetailsProps) {
    return (
        <Grid className="cols-4">
            <GridCell className="grid col-span-2 lg-col-span-1">
                <Field>
                    <Control expanded>
                        <Label>Created at</Label>
                    </Control>
                    <Control>{document.creation_date && dateTimestampFormat(document.creation_date)}</Control>
                </Field>
            </GridCell>
            <GridCell className="grid col-span-2 lg-col-span-1">
                <Field>
                    <Control expanded>
                        <Label>Created by</Label>
                    </Control>
                    <Control>{document.creation_user?.name}</Control>
                </Field>
            </GridCell>
            <GridCell className="grid col-span-2 lg-col-span-1">
                <Field>
                    <Control expanded>
                        <Label>Last edited at</Label>
                    </Control>
                    <Control>{document.last_edit_date && dateTimestampFormat(document.last_edit_date)}</Control>
                </Field>
            </GridCell>
            <GridCell className="grid col-span-2 lg-col-span-1">
                <Field>
                    <Control expanded>
                        <Label>Last edited by</Label>
                    </Control>
                    <Control>{document.last_edit_user?.name}</Control>
                </Field>
            </GridCell>
        </Grid>
    );
}
