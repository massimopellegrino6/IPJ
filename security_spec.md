# Security Specification - PropTech Decision Intelligence Platform

## 1. Data Invariants
1. **Property Ownership**: A property record must have a valid `id`, a string `ownerId` matching `request.auth.uid`, and cannot have its `ownerId` reassigned.
2. **Key Financial Boundaries**: `askingPrice` must be a positive number; `squareMeters` must be greater than zero.
3. **Audit Trail**: Every deliberated decision history record and decision log must point to a valid existing property record and belong to the authenticated operator.
4. **Denial-of-Wallet Guard**: All string attributes are strictly bounded by `maxLength` (IDs <= 128 chars, titles <= 256 chars, codes <= 64 chars).

## 2. Dirty Dozen Test Payloads
1. **ID Poisoning Attack**: An oversized 100KB string for `propertyId`. (Expected: REJECT)
2. **Ghost Field Injection**: Adding an unvetted `isSuperAdmin: true` into the Property document payload. (Expected: REJECT)
3. **Identity Spoofing**: Attempting to set `ownerId: "victim_uid"` while signed in as `"attacker_uid"`. (Expected: REJECT)
4. **Negative Price Exploit**: Submitting `askingPrice: -50000`. (Expected: REJECT)
5. **Blanket Query Scraping**: Querying collection without filtering by `ownerId`. (Expected: REJECT)
6. **Anonymous Modification**: Submitting a write without active Google authentication. (Expected: REJECT)
7. **Unverified Email Privilege**: Attempting write if email is unverified (when mandated). (Expected: REJECT)
8. **Immutability Breach**: Updating an existing property record to change its `id` or `ownerId`. (Expected: REJECT)
9. **Decision Task Hijacking**: Attempting to complete a decision task belonging to another agency operator. (Expected: REJECT)
10. **Orphan Decision History**: Creating a decision log referencing a non-existent `propertyId`. (Expected: REJECT)
11. **Type Distortion**: Setting `squareMeters` to a string `"eighty"`. (Expected: REJECT)
12. **Batch Desynchronization**: Altering decision outcome state without recording the associated event log. (Expected: REJECT)
