# NSN969 MULTIVIEW — DATABASE SCHEMA DOCUMENTATION

This document defines the database collections, schemas, permissions, and relationships used across the NSN969 MULTIVIEW project.


---

## 2. Supabase PostgreSQL Relational Schema & Mapping

Phase 8 introduces the target Supabase PostgreSQL relational schema with Row Level Security (RLS) policies.

| Firebase Collection | Supabase Table | Primary Key | Key Relationships / Indexes |
| :--- | :--- | :--- | :--- |
| `streamers` | `public.streamers` | `id` (TEXT) | Indexed by `platform`, `status` |
| `tracks` | `public.tracks` | `id` (TEXT) | Indexed by `id` |
| `gallery` | `public.gallery` | `id` (TEXT) | Indexed by `id` |
| `ic_characters` | `public.ic_characters` | `id` (TEXT) | Indexed by `faction` |
| `community_categories` | `public.community_categories` | `id` (TEXT) | Indexed by `position` |
| `community_channels` | `public.community_channels` | `id` (TEXT) | Foreign key to `community_categories(id)` ON DELETE CASCADE |
| `community_messages` | `public.community_messages` | `id` (TEXT) | Foreign key to `community_channels(id)` ON DELETE CASCADE. Composite index on `(channel_id, created_at DESC)` |
| `community_users` | `public.user_profiles` | `id` (TEXT) | Maps to `auth.users(id)`. Indexed by `role` |
| `settings` | `public.system_settings` | `id` (TEXT, default 'global') | Singleton system configuration row |

### Row Level Security (RLS) Principles
1. **Public Read**: All public tables (`streamers`, `tracks`, `gallery`, `ic_characters`, `community_categories`, `community_channels`, `community_messages`, `system_settings`) allow `SELECT` for anonymous and authenticated clients.
2. **Authenticated Member Writes**: Members can `INSERT` messages into open channels and `DELETE` their own messages. They cannot post to `admin_only` channels.
3. **Admin Full Access**: Checked via `public.is_admin()` database function linked to `user_profiles.role = 'admin'`. Admins can perform full CRUD across all tables.


### Collection: `streamers`
- **Purpose**: Stores streamer channels, live links, categories, and social media details for NSN969 members.
- **Fields**:
  - `id` (string, required): Document ID or slug (e.g., `streamer_1`)
  - `name` (string, required): Display name of the streamer
  - `platform` (string, required): `'YouTube' | 'TikTok' | 'Twitch'`
  - `channelId` (string, required): Channel ID or custom link ID
  - `youtubeId` (string, optional): Live video ID for YouTube embeds
  - `tiktokId` (string, optional): TikTok live identifier
  - `photoUrl` (string, optional): Avatar image URL
  - `category` (string, optional): `'Member' | 'VIP' | 'Guest'`
  - `isFeatured` (boolean, optional): Whether streamer is highlighted on main page
  - `isActive` (boolean, optional): Soft-delete flag (`true` active, `false` soft deleted)
  - `createdAt` (string, optional): ISO timestamp
- **Permissions**: Public Read / Admin Write

---

### Collection: `tracks`
- **Purpose**: Background audio playlist tracks played in the AudioPlayer deck.
- **Fields**:
  - `id` (string, required): Track ID
  - `title` (string, required): Song title
  - `artist` (string, required): Artist or composer name
  - `url` (string, required): Direct audio streaming URL
  - `cover` (string, optional): Album art URL
  - `duration` (number | string, optional): Track length in seconds or mm:ss
  - `active` (boolean, optional): Whether active in background rotation
  - `createdAt` (string, optional): ISO timestamp
- **Permissions**: Public Read / Admin Write

---

### Collection: `gallery`
- **Purpose**: Visual gallery photos and screenshots.
- **Fields**:
  - `id` (string, required): Item ID
  - `title` (string, required): Image caption / title
  - `url` (string, required): High-res image URL
  - `category` (string, optional): Category tag
  - `isActive` (boolean, optional): Visibility status
  - `createdAt` (string, optional): ISO timestamp
- **Permissions**: Public Read / Admin Write

---

### Collection: `ic_characters`
- **Purpose**: Roleplay In-Character (IC) templates and profiles for community members.
- **Fields**:
  - `id` (string, required): Character ID (`char_*`)
  - `memberId` (string, optional): Associated member account ID
  - `memberName` (string, optional): OOC member name
  - `characterName` (string, required): In-game RP character name
  - `characterAlias` (string, optional): Character nickname or callsign
  - `characterImage` (string, optional): Portrait / avatar URL
  - `role` (string, required): RP role (e.g., `Underboss`, `Medic`, `Citizen`)
  - `age` (number, optional): In-game age
  - `gender` (string, optional): `'Male' | 'Female' | 'Other'`
  - `occupation` (string, optional): IC job/profession
  - `personality` (string, optional): Character personality traits
  - `background` (string, optional): IC backstory
  - `status` (string, required): `'active' | 'inactive' | 'deceased' | 'archived'`
  - `socialLinks` (map, optional): `{ twitter?: string, instagram?: string, youtube?: string }`
  - `createdAt` (string, optional): ISO timestamp
  - `updatedAt` (string, optional): ISO timestamp
- **Permissions**: Public Read / Admin Write

---

### Collection: `community_categories`
- **Purpose**: Category grouping headers for Community channels (Discord-like channels).
- **Fields**:
  - `id` (string, required): Category ID (`cat_*`)
  - `name` (string, required): Display category header (e.g., `📢 ANNOUNCEMENTS`)
  - `position` (number, required): Sort order position
  - `isVisible` (boolean, required): Visibility toggle
- **Permissions**: Public Read / Admin Write

---

### Collection: `community_channels`
- **Purpose**: Individual chat channels within a community category.
- **Fields**:
  - `id` (string, required): Channel ID / slug (e.g., `general`, `announcements`)
  - `categoryId` (string, required): Foreign key matching `community_categories.id`
  - `name` (string, required): Channel slug name
  - `description` (string, optional): Channel topic / description
  - `type` (string, required): `'text' | 'announcement' | 'roleplay' | 'stream' | 'voice'`
  - `position` (number, required): Order index in category
  - `isActive` (boolean, required): Channel status
  - `adminOnly` (boolean, optional): If `true`, only Admins/Mods can send messages
- **Permissions**: Public Read / Admin Write

---

### Collection: `community_messages`
- **Purpose**: Chat message stream per channel.
- **Fields**:
  - `id` (string, required): Message ID (`msg_*`)
  - `channelId` (string, required): Foreign key to `community_channels.id`
  - `userId` (string, required): User ID or guest identifier
  - `userName` (string, required): Author display name
  - `userAvatar` (string, optional): Author avatar URL
  - `userRole` (string, optional): `'admin' | 'moderator' | 'member' | 'guest'`
  - `content` (string, required): Message text body
  - `isPinned` (boolean, optional): Pinned message indicator
  - `replyTo` (map, optional): `{ id: string, userName: string, content: string }`
  - `createdAt` (string, required): ISO timestamp
- **Permissions**: Public Read / Authenticated & Guest Write / Admin Delete & Pin

---

### Collection: `community_users` / `community_members`
- **Purpose**: Community membership profiles linked to authentication or guest handles.
- **Fields**:
  - `id` (string, required): Document ID (matches Firebase Auth `uid` or guest ID)
  - `userId` (string, required): Linked user identifier
  - `displayName` (string, required): Handle display name
  - `avatarUrl` (string, optional): User avatar link
  - `role` (string, required): `'guest' | 'member' | 'moderator' | 'admin'`
  - `status` (string, optional): `'online' | 'idle' | 'offline'`
  - `lastSeenAt` (string, optional): ISO timestamp
  - `createdAt` (string, optional): ISO timestamp
- **Permissions**: Public Read / User Self-Update / Admin Write

---

### Collection: `settings`
- **Purpose**: System-wide global configuration (announcements, feature flags, maintenance mode).
- **Document ID**: `global_config`
- **Fields**:
  - `announcementActive` (boolean)
  - `announcementEn` (string)
  - `announcementId` (string)
  - `maintenanceMode` (boolean)
- **Permissions**: Public Read / Admin Write
