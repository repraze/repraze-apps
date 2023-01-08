import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import React, {
    MouseEventHandler,
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {EventEmitter} from "../../../repraze-utils/event-emitter";
import {Colors} from "../../constants";
import {Button} from "../button/button";
import {Control, Field, Fields} from "../form/field/field";
import {Icon} from "../icon/icon";

export interface ModalEmitterInterface {
    show: [ReactNode];
    clear: [];
}

export const ModalContext = createContext(new EventEmitter<ModalEmitterInterface>());

export interface ModalProviderProps {
    children?: ReactNode;
}

export function ModalProvider({children}: ModalProviderProps) {
    const emitter = new EventEmitter<ModalEmitterInterface>();
    return (
        <ModalContext.Provider value={emitter}>
            <ModalRenderer />
            {children}
        </ModalContext.Provider>
    );
}

export function ModalRenderer() {
    const [modal, setModal] = useState<ReactNode>(null);

    const emitter = useContext(ModalContext);

    useEffect(() => {
        function showModal(modal: ReactNode) {
            setTimeout(() => {
                setModal(modal);
            }, 0);
        }
        function clearModal() {
            setTimeout(() => {
                setModal(null);
            }, 0);
        }

        emitter.on("show", showModal);
        emitter.on("clear", clearModal);
        return () => {
            emitter.off("show", showModal);
            emitter.off("clear", clearModal);
        };
    }, [emitter, setModal]);

    return <>{modal}</>;
}

export function useModal() {
    const emitter = useContext(ModalContext);
    const methods = useMemo(() => {
        return {
            showModal(modal: ReactNode): void {
                emitter.emit("show", modal);
            },
            clearModal(): void {
                emitter.emit("clear");
            },
        };
    }, [emitter]);

    return methods;
}

export interface ModalProps {
    cancelable?: boolean;
    onCancel?: () => void;
    children?: ReactNode;
}

export function Modal({cancelable, onCancel, children}: ModalProps) {
    const {clearModal} = useModal();

    const handleCancel = useCallback<MouseEventHandler<HTMLDivElement>>(
        (event) => {
            // only cancel on bg click
            if (event.target === event.currentTarget) {
                clearModal();
                if (onCancel) {
                    onCancel();
                }
            }
        },
        [onCancel, clearModal]
    );

    return (
        <div className="modal-container" onClick={cancelable ? handleCancel : undefined}>
            <div className="modal">{children}</div>
        </div>
    );
}

export type ModalDialogAction = {
    id: string;
    color?: Colors;
    label?: string;
    icon?: IconProp;
    iconSpin?: boolean;
    iconPulse?: boolean;
};

export interface ModalDialogProps {
    className?: string;
    title: string;
    text?: React.ReactNode;
    actions: ModalDialogAction[];
    onAction?: (actionId: string) => void;
    onCancel?: () => void;
    cancelable?: boolean;
}

export function ModalDialog({title, text, actions, onAction, onCancel, cancelable}: ModalDialogProps) {
    const {clearModal} = useModal();
    const doneRef = useRef(false);

    const handleAction = (id: string) => {
        if (onAction && !doneRef.current) {
            doneRef.current = true;
            onAction(id);
        }
    };

    const handleCancel = useCallback(() => {
        clearModal();
        if (onCancel) {
            onCancel();
        }
    }, [onCancel, clearModal]);

    return (
        <Modal cancelable={cancelable} onCancel={onCancel}>
            {cancelable && (
                <Button color={Colors.Transparent} className="close" onClick={handleCancel}>
                    <Icon icon={faTimes} />
                </Button>
            )}
            <div className="modal-heading">
                <div className="modal-title">{title}</div>
            </div>
            {text && <div className="modal-body">{text}</div>}
            <div className="modal-footer">
                <Fields>
                    <Field grouped right>
                        {" "}
                        {actions.map(({id, color, label, icon, iconSpin, iconPulse}) => (
                            <Control key={id}>
                                <Button color={color} onClick={handleAction.bind(undefined, id)}>
                                    {icon && <Icon icon={icon} spin={iconSpin} pulse={iconPulse} fixedWidth />}
                                    {label && <span>{label}</span>}
                                </Button>
                            </Control>
                        ))}
                    </Field>
                </Fields>
            </div>
        </Modal>
    );
}
