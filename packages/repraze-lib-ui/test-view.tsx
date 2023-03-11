import {faAngleDown, faAngleLeft, faAngleRight, faSearch, faSmile, faTimes} from "@fortawesome/free-solid-svg-icons";
import React, {ComponentType, useState} from "react";

import {Button} from "./components/button/button";
import {Content} from "./components/content/content";
import {
    DataTable,
    DataTableBody,
    DataTableColumn,
    DataTableFilterCellProps,
    DataTableFilterRow,
    DataTableFilterView,
    DataTableFoot,
    DataTableHead,
    DataTableInfoRow,
    DataTablePropView,
    DataTableRootView,
    DataTableSortRow,
    DataTableSortRowMethod,
    DataTableSortView,
    DataTableTitleRow,
    DataTableVirtualizedBody,
    createDataTableDateFilter,
    createDataTableDateSort,
    createDataTableNumberFilter,
    createDataTableStringFilter,
    createDataTableStringSort,
} from "./components/data-table/data-table";
import {Control, Field, Fields} from "./components/form/field/field";
import {InputFile} from "./components/form/input-file/input-file";
import {InputSwitch} from "./components/form/input-switch/input-switch";
import {InputTag} from "./components/form/input-tag/input-tag";
import {Input} from "./components/form/input/input";
import {Select, SelectOption} from "./components/form/select/select";
import {Icon} from "./components/icon/icon";
import {Pagination} from "./components/pagination/pagination";
import {Title} from "./components/title/title";
import {Colors, Sizes} from "./constants";
import {Hero} from "./layout/hero/hero";
import {Section} from "./layout/section/section";
import {Wrapper} from "./layout/wrapper/wrapper";

const SELECT_OPTIONS: SelectOption[] = [
    {label: "Option 1", value: 1},
    {label: "Option 2", value: 2},
    {label: "Option 3", value: 3},
];

const TAGS = ["tag1", "tag2", "tag3"];

interface TestData {
    id: number;
    name: string;
    created_at: Date;
}

export function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomItem<T>(a: T[]): T {
    return a[randomInt(0, a.length - 1)];
}

function generateData<T>(params: {[K in keyof T]: (index: number) => T[K]}, count: number): T[] {
    const data: T[] = [];
    for (let i = 0; i < count; ++i) {
        const row: Partial<T> = {};
        for (const key in params) {
            row[key] = params[key](i);
        }
        data.push(row as T);
    }
    return data;
}

const DATA = generateData(
    {
        id: (i) => i,
        name: () => "Ellie",
        created_at: () => new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 365),
    },
    100
);

const BIG_DATA = generateData(
    {
        id: (i) => i,
        name: () => randomItem(["Ellie", "Tom", "Bob"]),
        created_at: () => new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 365),
    },
    10000
);

const COLUMNS: DataTableColumn<typeof DATA[0]>[] = [
    {
        id: "id",
        cell: "id",
        width: 65,
        grow: 0,
        align: "right",
    },
    {
        id: "name",
        cell: (row) => row.name,
        width: 200,
        grow: 0.75,
    },
    {
        id: "date",
        cell: (row) => row.created_at.toDateString() + " --- " + row.created_at.getTime(),
        rawCell: "created_at",
        width: 200,
        grow: 0.25,
    },
];

const SORTS: {[K: string]: DataTableSortRowMethod[]} = {
    name: createDataTableStringSort(),
    date: createDataTableDateSort(),
};

const FILTERS: {[K: string]: ComponentType<DataTableFilterCellProps>} = {
    id: createDataTableNumberFilter({step: 1, min: 0, inputProps: {placeholder: "num"}}),
    name: createDataTableStringFilter({inputProps: {placeholder: "str"}}),
    date: createDataTableDateFilter(),
};

export function TestView() {
    const [tags, setTags] = useState<string[]>(TAGS);
    const rootView = new DataTableRootView(COLUMNS, DATA);

    const bigRootView = new DataTableRootView(COLUMNS, BIG_DATA);
    const filterView = new DataTableFilterView(bigRootView);
    const sortView = new DataTableSortView(filterView);
    const propView = new DataTablePropView(sortView, (row) => {
        if (row.id % 16 === 0) {
            return {className: "active"};
        }
        return {};
    });

    return (
        <>
            <Hero>
                <Wrapper>
                    <Title size={1}>Test Title</Title>
                    <Title size={3} subtitle>
                        Test Subtitle
                    </Title>
                </Wrapper>
            </Hero>
            <Section>
                <Wrapper>
                    <Content>
                        <h1>Test</h1>

                        <h2>Content</h2>

                        <p>
                            Lorem ipsum dolor sit amet, <b>consectetur adipiscing</b> elit. Morbi at mollis est. Nullam
                            consectetur urna at velit bibendum pretium. Nam sed ultricies magna. Donec interdum lorem
                            eget commodo viverra. Morbi malesuada magna nunc, id cursus odio facilisis ultrices.
                            Praesent mollis urna scelerisque lacinia sollicitudin. Lorem ipsum dolor sit amet,
                            consectetur adipiscing elit. Fusce eu urna id velit pulvinar sodales at id enim. Nullam
                            augue metus, <i>malesuada et dignissim</i> ut, accumsan quis tellus.
                        </p>

                        <h2>DataTable</h2>

                        {/*<DataTable expand striped hoverable style={{height: "525px"}}>
                            <DataTableHead view={propView}>
                                <DataTableSortRow view={propView} sortView={sortView} sorts={SORTS} />
                                <DataTableFilterRow view={propView} filterView={filterView} filters={FILTERS} />
                            </DataTableHead>
                            <DataTableVirtualizedBody view={propView}></DataTableVirtualizedBody>
                            <DataTableFoot view={propView}>
                                <DataTableInfoRow view={propView} />
                            </DataTableFoot>
    </DataTable>*/}

                        <h2>Button</h2>

                        <h3>Sizes</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <Button>Default</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button size={Sizes.Small}>Small</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button size={Sizes.Normal}>Normal</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button size={Sizes.Medium}>Medium</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button size={Sizes.Large}>Large</Button>
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Colors</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <Button>Default</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.White}>White</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Light}>Light</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Dark}>Dark</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Black}>Black</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Primary}>Primary</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Success}>Success</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Warning}>Warning</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Danger}>Danger</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Info}>Info</Button>
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Button color={Colors.Transparent}>Transparent</Button>
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Input</h2>

                        <h3>Sizes</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <Input defaultValue="Default" />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Small" size={Sizes.Small} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Normal" size={Sizes.Normal} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Medium" size={Sizes.Medium} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Large" size={Sizes.Large} />
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Colors</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <Input defaultValue="Default" />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="White" color={Colors.White} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Light" color={Colors.Light} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Dark" color={Colors.Dark} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Black" color={Colors.Black} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Primary" color={Colors.Primary} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Success" color={Colors.Success} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Warning" color={Colors.Warning} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Danger" color={Colors.Danger} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Info" color={Colors.Info} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Input defaultValue="Transparent" color={Colors.Transparent} />
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Icons</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control leftIcon={faSmile}>
                                    <Input defaultValue="Default Left" />
                                </Control>
                            </Field>
                            <Field>
                                <Control rightIcon={faTimes}>
                                    <Input defaultValue="Small Right" size={Sizes.Small} />
                                </Control>
                            </Field>
                            <Field>
                                <Control leftIcon={faAngleLeft} rightIcon={faAngleRight}>
                                    <Input defaultValue="Medium Both" size={Sizes.Medium} />
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Input Select</h2>

                        <h3>Sizes</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <Select defaultValue={1} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={2} size={Sizes.Small} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={3} size={Sizes.Normal} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={1} size={Sizes.Medium} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={2} size={Sizes.Large} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Colors</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <Select defaultValue={1} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={2} color={Colors.White} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={3} color={Colors.Light} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={1} color={Colors.Dark} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={2} color={Colors.Black} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={3} color={Colors.Primary} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={1} color={Colors.Success} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={2} color={Colors.Warning} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={3} color={Colors.Danger} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={1} color={Colors.Info} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <Select defaultValue={2} color={Colors.Transparent} options={SELECT_OPTIONS} />
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Input Switch</h2>

                        <h3>Sizes</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <InputSwitch />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch size={Sizes.Small} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch size={Sizes.Normal} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch size={Sizes.Medium} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch size={Sizes.Large} />
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Colors</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <InputSwitch />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.White} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Light} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Dark} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Black} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Primary} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Success} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Warning} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Danger} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Info} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputSwitch color={Colors.Transparent} />
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Input Tag</h2>

                        <h3>Sizes</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} size={Sizes.Small} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} size={Sizes.Normal} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} size={Sizes.Medium} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} size={Sizes.Large} />
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Colors</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.White} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Light} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Dark} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Black} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Primary} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Success} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Warning} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Danger} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Info} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputTag tags={tags} onTagsChange={setTags} color={Colors.Transparent} />
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Input File</h2>

                        <h3>Sizes</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <InputFile />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile size={Sizes.Small} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile size={Sizes.Normal} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile size={Sizes.Medium} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile size={Sizes.Large} />
                                </Control>
                            </Field>
                        </Fields>

                        <h3>Colors</h3>
                        <Fields inline wrapped>
                            <Field>
                                <Control>
                                    <InputFile />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.White} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Light} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Dark} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Black} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Primary} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Success} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Warning} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Danger} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Info} />
                                </Control>
                            </Field>
                            <Field>
                                <Control>
                                    <InputFile color={Colors.Transparent} />
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Combined Inputs</h2>
                        <Fields>
                            <Field>
                                <Control>
                                    <Input defaultValue="Regular" />
                                </Control>
                                <Control leftIcon={faSmile} expanded>
                                    <Input defaultValue="Expanded" />
                                </Control>
                                <Control>
                                    <Button>
                                        <Icon icon={faAngleDown} />
                                    </Button>
                                </Control>
                            </Field>
                        </Fields>

                        <h2>Pagination</h2>
                        <h3>Default</h3>
                        {new Array(10).fill(0).map((a, i) => (
                            <Pagination itemsCount={100} itemsCountPerPage={10} pageSelected={i} key={i} />
                        ))}

                        <h3>Range</h3>
                        <Pagination itemsCount={100} itemsCountPerPage={10} pageSelected={4} pageRange={2} />

                        <h3>Label</h3>
                        <Pagination
                            itemsCount={100}
                            itemsCountPerPage={10}
                            pageSelected={4}
                            label={(p) => `Page ${p + 1}`}
                        />
                    </Content>
                </Wrapper>
            </Section>
        </>
    );
}
