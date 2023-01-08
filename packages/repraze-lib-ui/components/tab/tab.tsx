import classnames from "classnames";
import React, {HTMLAttributes, ReactNode, useCallback, useState} from "react";

export interface TabProps extends HTMLAttributes<HTMLLIElement> {
    className?: string;
    children?: ReactNode;
}

export function Tab({className, children, ...props}: TabProps) {
    return (
        <li className={classnames("tab", className)} {...props}>
            <a>{children}</a>
        </li>
    );
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    children?: ReactNode;
}

export function Tabs({className, children, ...props}: TabsProps) {
    return (
        <div className={classnames("tabs", className)} {...props}>
            <ul>{children}</ul>
        </div>
    );
}

export interface TabItem {
    id: string;
    label: ReactNode;
    description?: string;
    content: ReactNode;
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
    tabs: TabItem[];
    defaultTabId?: string;
}

export function TabsPanel({className, tabs, defaultTabId, ...props}: TabsPanelProps) {
    const [id, setId] = useState<string | undefined>(defaultTabId);

    const handleTabClick = useCallback(
        (id: string) => {
            setId(id);
        },
        [setId]
    );

    return (
        <div className={classnames("tabs-panel", className)} {...props}>
            <Tabs>
                {tabs.map((tab) => (
                    <Tab
                        key={tab.id}
                        className={tab.id === id ? "active" : undefined}
                        onClick={handleTabClick.bind(undefined, tab.id)}
                    >
                        {tab.label}
                    </Tab>
                ))}
            </Tabs>
            <div className="tabs-panel-content">{tabs.find((tab) => tab.id === id)?.content}</div>
        </div>
    );
}
