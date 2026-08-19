/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the separately run Dialogue Server answers. Never a credential. */
  readonly VITE_DIALOGUE_SERVER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
