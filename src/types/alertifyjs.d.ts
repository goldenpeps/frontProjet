declare module 'alertifyjs' {
  interface AlertifyDialog {
    set(name: string, value: unknown): AlertifyDialog;
  }

  interface Alertify {
    confirm(
      title: string,
      message: string,
      onok?: () => void,
      oncancel?: () => void
    ): AlertifyDialog;
  }

  const alertify: Alertify;
  export default alertify;
}
