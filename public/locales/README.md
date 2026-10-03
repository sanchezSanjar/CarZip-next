# Translations

One folder per language, as next-i18next expects: `en` English (default), `kr` Korean, `ru` Russian, `uz` Uzbek.
Every page loads `common.json` of the visitor's language (`withTranslations` in `libs/i18n.ts`).

All four files must have the same keys. A missing key shows the key name on the page instead of a text.
