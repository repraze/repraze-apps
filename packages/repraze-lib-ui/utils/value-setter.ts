export function setInputValue(input: HTMLInputElement, value: string) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    if (setter) {
        const changeEvent = new Event("input", {bubbles: true});
        setter.call(input, value.toString());
        input.dispatchEvent(changeEvent);
    }
}

export function setInputFileValue(input: HTMLInputElement, files: FileList) {
    input.files = files;
    const changeEvent = new Event("change", {bubbles: true});
    input.dispatchEvent(changeEvent);
}

export function setSelectValue(select: HTMLSelectElement, value: string) {
    select.value = value.toString();
    const changeEvent = new Event("change", {bubbles: true});
    select.dispatchEvent(changeEvent);
}

export function setTextAreaValue(textArea: HTMLTextAreaElement, value: string) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    if (setter) {
        const changeEvent = new Event("input", {bubbles: true});
        setter.call(textArea, value);
        textArea.dispatchEvent(changeEvent);
    }
}
