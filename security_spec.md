# Security Specification for NSN969 Stream Hub

This document defines the zero-trust security architecture, invariants, and threat analysis for the NSN969 Firestore database structures.

## 1. Data Invariants

- **Read Access**: Real-time backsound tracks, active streamer nodes, and general layout configuration settings must be publicly readable to guarantee uninterrupted visual rendering for guest streamers and visitors.
- **Write Privilege**: Creation, modification, and deletion of any metadata (System Config, Tracks, Streamer records) are strictly restricted to authenticated and verified Operators (Admins).
- **ID Integrity**: Document ID parameters inside `settings`, `tracks`, and `streamers` must match specific ID validation regex and size criteria to avoid wallet-busting or resource-bloating attacks.

## 2. The "Dirty Dozen" (Adversarial Payloads)

Here are the 12 malicious payloads designed to dry-run and attack the core integrity of the security rules:

1. **Unsigned-In Write on Settings (Anomaly ID: D1)**
   - *Attack*: Attempting to update `settings/global` with a completely unauthenticated connection.
   - *Result*: `PERMISSION_DENIED` (Auth Check failure).

2. **Unsigned-In Write on Tracks (Anomaly ID: D2)**
   - *Attack*: Attempting to register a track with an unauthenticated connection.
   - *Result*: `PERMISSION_DENIED` (Auth Check failure).

3. **Non-Admin Verification Escalate (Anomaly ID: D3)**
   - *Attack*: An authenticated standard client (`user_id = "hacker_99"`, unverified/non-admin email) trying to rewrite `settings/global` to activate maintenance mode.
   - *Result*: `PERMISSION_DENIED` (Role Check failure).

4. **Shadow Field Injection on Settings (Anomaly ID: D4)**
   - *Attack*: Authenticated operator attempts to write `settings/global` but includes a hidden ghost field `"debug_backdoor": true`.
   - *Result*: `PERMISSION_DENIED` (Map size and strict keys failure).

5. **Resource Poisoning with Massive ID (Anomaly ID: D5)**
   - *Attack*: Administrative user attempting to create a track using a bloated document identifier (a 1MB key string of random characters).
   - *Result*: `PERMISSION_DENIED` (`isValidId` size bounds check fail).

6. **Invalid Track Source Type (Anomaly ID: D6)**
   - *Attack*: Authorized Operator attempts to save a track containing a boolean instead of a string for the `url`.
   - *Result*: `PERMISSION_DENIED` (Type check failure).

7. **Missing Track ID Mapping (Anomaly ID: D7)**
   - *Attack*: Operator attempts to assign a track where `trackId` in url doesn't match the inner JSON payload's `.id` field string.
   - *Result*: `PERMISSION_DENIED` (Relational ID match failure).

8. **Poisoning Streamer Platform Enum (Anomaly ID: D8)**
   - *Attack*: Operator attempts to add a streamer node with flat, unsupported platform enum value `"netflix"`.
   - *Result*: `PERMISSION_DENIED` (`platform` Enum validation failure).

9. **Injecting Extra Parameter in Streamer Schema (Anomaly ID: D9)**
   - *Attack*: Operator attempts to post a streamer with extraneous malicious property `"isOperator": true`.
   - *Result*: `PERMISSION_DENIED` (Strict schemas check failed).

10. **Write Operation on Inexistent settings doc endpoint (Anomaly ID: D10)**
    - *Attack*: Operator attempts to initialize config at `/settings/arbitrary_settings_path_fake`.
    - *Result*: `PERMISSION_DENIED` (Document ID path validation failure).

11. **Injecting Non-String into Streamer Category (Anomaly ID: D11)**
    - *Attack*: Operator saves a streamer node that registers the optional `category` field as a number/array structure instead of a string.
    - *Result*: `PERMISSION_DENIED` (Category optional string typing failure).

12. **Bloated String Value Payload Denial-of-Wallet (Anomaly ID: D12)**
    - *Attack*: Operator writes a global system warning alert containing a 10MB string.
    - *Result*: `PERMISSION_DENIED` (`announcement_en.size() <= 1000` size constraints failure).

## 3. Test Validation Plan

A validation script verifies that each of these "Dirty Dozen" payloads yields `PERMISSION_DENIED` in the Firestore test suite environment, confirming complete immunity to unauthorized state transitions.
