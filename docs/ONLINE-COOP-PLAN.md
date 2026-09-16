# Online co-op: next networking milestone

Status: design only. Version 0.4 implements local two-player co-op. It has no rooms, backend, network transport, matchmaking, or remote persistence. Local play does not establish that the simulation tolerates latency.

The existing simulation accepts one input record per player at a fixed step. Player IDs, independent combat state, shared encounter state, separation limits, down/revive behavior, enemy scaling, and host-device reward ownership are the foundations to retain.

## First bounded network build

Start with two-player private rooms and a host-authoritative simulation. The host runs enemy AI, collisions, damage, drops, XP, RNG, and chapter transitions. Clients send sequenced inputs, not claimed damage, kills, currency, or unlocks. A guest predicts their own movement and reconciles to host snapshots; remote actors interpolate between snapshots. Use explicit integer simulation ticks and an input acknowledgement sequence. Separate visual particles/audio from authoritative state so correction does not replay rewards or every sound.

Define explicit serializable snapshots for players, encounters, enemies, projectiles, props, cart, pickups, boss states, RNG and sequence counters. Sets such as per-attack hit IDs must serialize as arrays and restore consistently. Today’s public Game object is not a network protocol, and JavaScript floating-point simulation alone should not be assumed to provide deterministic peer lockstep.

Transport choice needs a spike on the actual native Android/iOS WebViews: compare a relay WebSocket prototype against WebRTC data channels with signaling/TURN. Measure input delay and interruption recovery before committing. Do not introduce account creation or public matchmaking for the first private-room build.

## Ownership and interruptions

The host is authoritative for the shared run; the guest receives a clearly described participation reward only if guest persistence is deliberately added. Otherwise, state plainly that the host device owns rewards, matching local play. Reward application needs a unique run ID and an idempotent completion record so reconnecting cannot duplicate gold/XP/items. Never trust a guest-supplied final save.

On guest disconnect, pause briefly and show reconnect/return options. Keep one reserved player slot and a bounded input history. On host departure, end the session gracefully without claiming unbanked rewards were saved; host migration is a separate feature. Mobile backgrounding, temporary packet loss, and expired reconnect windows need explicit states rather than silent loss of control. A downed guest must not prevent encounter completion indefinitely.

## Acceptance work

- Same LAN, then relay connections with 50/100/180 ms latency, jitter, duplication, packet loss, and reordering.
- Simultaneous launch/juggle, bowling chains, body/spring collision, laundry jams, cart delivery, revival and boss defeat agree on both screens.
- Inputs are bounded, sequence-checked, rate-limited and attributed to the correct player. Malformed snapshots and guest currency/damage claims cannot mutate the host save.
- Duplicate completion messages never duplicate rewards; reconnect restores a coherent encounter and save ownership.
- Real Android/iOS controllers, audio/lifecycle interruptions, screen rotation, and a sustained thermal run.
- Human co-op observation confirms responsive timing before matchmaking, accounts or additional players are considered.

This networking milestone requires implementation and tests after the revised combat is assessed by players. No multiplayer service is deployed or billed by the current project.
