export async function copyToClipboard(value: string): Promise<boolean> {
    // navigator clipboard api needs a secure context (https)
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(value);
            return true;
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = value;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const copied = document.execCommand("copy");
            textArea.remove();
            if (copied) {
                return true;
            }
        }
    } catch (e) {
        console.error(e);
    }
    return false;
}
