# @red-binder/schema

The intake is **one composed Zod schema**: a shared `core` plus the subschemas of the
documents the user selected. This is what lets "enter once, many documents" work without
collisions.

```
core.ts        Entered once: the single identity model (full legal name capturing BOTH
               surnames separately — apellido paterno + apellido materno — which also
               yields first/last for documents that use a simple name), DOB, address,
               county, phone, emergency contacts, agents.
poa.ts         POA-only fields (effectiveness, jurisdiction). Reads name + core fields from
               core; defines no name fields. No dependency on immigration status.
detention.ts   Pocket Plan: immigration status (the branch key), A-number, aliases, country
               of birth, fear-of-return, chosen path, lawyer + trusted-person fields, photo.
               Sources surnames from core. No dependency on the selected state.
rbp.ts         Red Binder Plan: children, document locations.
```

**Composition rule:** full payload = `core` ∪ (selected subschemas). **Data minimization is
enforced by composition** — a POA-only user's payload never contains detention fields
(including immigration status), because that subschema was never added.

POA branches on **state**; the Pocket Plan branches on **immigration status**. Orthogonal
axes; neither reaches into the other. No document gates another.

Built in build phases 3–4. The exact `core` shape — including how the dual-surname model
derives `principal_first`/`principal_last`, and where the agent chain lives — is an open
decision flagged at the build checkpoint.
