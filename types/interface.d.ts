export interface IElectronAPI {
    exit: () => void
}

declare global {
    interface Window {
        electronApi: IElectronAPI
    }
}