import { configurations } from "@/configurations";

function DisableDevTools() {
    if (configurations.app.env !== "development") {
        const blockDevTools = (e: KeyboardEvent) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.metaKey && e.altKey && e.key === 'I')
            ) {
                e.preventDefault();
            }
        };

        window.addEventListener('keydown', blockDevTools);
        window.addEventListener('contextmenu', (e) => e.preventDefault());

        const clearConsole = () => {
            if (configurations.app.env !== 'development') {
                console.clear();
                setTimeout(clearConsole, 100);
            }
        };
        clearConsole();
    }
}

export default DisableDevTools;