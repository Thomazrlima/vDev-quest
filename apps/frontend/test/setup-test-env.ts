import { afterEach } from "bun:test";
import { Window } from "happy-dom";

const browser = new Window({ url: "http://localhost:3000" });
Object.assign(globalThis, {
    window: browser,
    document: browser.document,
    navigator: browser.navigator,
    Node: browser.Node,
    Element: browser.Element,
    HTMLElement: browser.HTMLElement,
    HTMLInputElement: browser.HTMLInputElement,
    HTMLSelectElement: browser.HTMLSelectElement,
    HTMLTextAreaElement: browser.HTMLTextAreaElement,
    Event: browser.Event,
    EventTarget: browser.EventTarget,
    MouseEvent: browser.MouseEvent,
    KeyboardEvent: browser.KeyboardEvent,
    FormData: browser.FormData,
    getComputedStyle: browser.getComputedStyle.bind(browser),
    requestAnimationFrame: (callback: FrameRequestCallback) => setTimeout(callback, 0),
    cancelAnimationFrame: clearTimeout,
    IS_REACT_ACT_ENVIRONMENT: true,
});

const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);
