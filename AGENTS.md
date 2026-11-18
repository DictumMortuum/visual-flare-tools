# Architecture rules

- Store user-provided guide images as Lovable Assets pointers and import their URLs, so uploaded media stays out of the source repository.
- Keep tier-list data access in a JavaScript extapi service and ranking transformations in pure JavaScript helpers, so the existing backend can evolve independently of the board UI.