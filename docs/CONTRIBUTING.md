# Contributing to KiddyFun Code

Thank you for helping kids learn programming and English!

## Add an example

1. Edit `assets/js/examples.js`
2. Add an object with `id`, `category`, `title`, `desc`, `code`
3. Run `npm run test:examples` to verify it parses

## Add a mission

1. Edit `assets/js/missions.js`
2. Copy an existing mission block
3. Implement `validate(code)` returning boolean
4. Update progress text in `ui.js` if mission count changes

## Add a lesson

1. Edit `assets/data/curriculum.json`
2. Keep lesson `id` unique (e.g. `L3-6`)
3. Lessons panel reloads from JSON automatically

## Language changes

1. Keywords: `assets/js/lexer.js`
2. Grammar: `assets/js/parser.js`
3. Execution: `assets/js/interpreter.js` or `game-interpreter.js`
4. Update `docs/LANGUAGE.md` and `assets/js/syntax-reference.js`

## Pull requests

- Run `npm test` before submitting
- One feature per PR when possible
- Do not commit secrets (`.env`, Supabase keys)

*Programming School — Cumilla*
