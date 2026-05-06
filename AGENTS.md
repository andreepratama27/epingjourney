# EpingJourney

This project is used to track breasfeeding mothers's schedule for pumping.

## UI Design

This project use COSS UI (https://coss.com/ui/llms.txt) as the main component. When you want to add component, uses:
```
npx shadcn@latest add @coss/<component_name>
```


## Task Tracking

This project uses `bd` (Beads) for issue tracking.
- Run `bd prime` for workflow context.
- Run `bd ready --json` before starting work.
- Use `bd create`, `bd show <id>`, `bd update <id> --status in_progress`, `bd close <id> --reason "Done"`.
- Do not use markdown TODO/task lists.
