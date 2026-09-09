/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Formspree form id (the part after https://formspree.io/f/ once you
   * create a form at formspree.io). Leave unset and the contact form
   * falls back to a mailto: link instead of a live submission.
   */
  readonly VITE_FORMSPREE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
