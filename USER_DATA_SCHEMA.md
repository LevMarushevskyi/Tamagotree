# Tomagotree User Data Schema

This document provides a comprehensive overview of all user-related data stored in the Tomagotree application.

## User Profile Data (`profiles` table)

### Core User Information
| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `id` | UUID | User's unique identifier (references auth.users) | ✅ | - |
| `username` | TEXT | User's display name (unique) | ✅ | - |
| `created_at` | TIMESTAMP | Account creation date/time | ✅ | NOW() |
| `updated_at` | TIMESTAMP | Last profile update date/time | ✅ | NOW() |

### Profile Customization
| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `avatar_url` | TEXT | Profile picture URL | ❌ | null |
| `profile_private` | BOOLEAN | Whether profile is private or public | ✅ | false |

### Gamification & Progress
| Field | Type | Description | Required | Default |
|-------|------|-------------|----------|---------|
| `total_xp` | INTEGER | Total experience points earned | ✅ | 0 |
| `level` | INTEGER | Current user level | ✅ | 1 |
| `guardian_rank` | TEXT | Guardian rank title (e.g., "Seedling", "Sapling", "Tree Guardian") | ✅ | "Seedling" |

### Guardian Rank System
The `guardian_rank` field represents the user's progression tier:
- **Seedling** (Default): New users, 0-10 trees
- **Sapling**: Growing guardians, 11-25 trees
- **Tree Guardian**: Experienced caretakers, 26-50 trees
- **Forest Keeper**: Master guardians, 51-100 trees
- **Ancient Protector**: Legendary guardians, 100+ trees

## Authentication Data (`auth.users` - Supabase Auth)

User authentication is handled by Supabase Auth and includes:
- **Email**: User's email address
- **Password**: Hashed password (handled securely by Supabase)
- **UID**: Same as profile ID, managed by Supabase

## Adopted Trees (`trees` table)

Trees that users have planted/reported:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique tree identifier |
| `user_id` | UUID | Owner's user ID |
| `name` | TEXT | User-given tree name |
| `species` | TEXT | Tree species (optional) |
| `latitude` | DECIMAL(10,8) | Geographic latitude |
| `longitude` | DECIMAL(11,8) | Geographic longitude |
| `photo_url` | TEXT | Tree photo URL (optional) |
| `age_days` | INTEGER | Days since planting |
| `health_status` | TEXT | Current health (e.g., "healthy", "needs water") |
| `xp_earned` | INTEGER | XP earned from this tree |
| `created_at` | TIMESTAMP | When tree was reported |
| `updated_at` | TIMESTAMP | Last update timestamp |

**Privacy Note**: Trees visibility can be controlled via the profile settings. The `profile_private` setting affects whether trees appear on public maps.

## Tree Graveyard (`tree_graveyard` table)

Memorial for deceased trees:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Graveyard entry ID |
| `user_id` | UUID | Owner's user ID |
| `original_tree_id` | UUID | Reference to original tree (optional) |
| `name` | TEXT | Tree name |
| `species` | TEXT | Tree species (optional) |
| `latitude` | DECIMAL(10,8) | Location latitude |
| `longitude` | DECIMAL(11,8) | Location longitude |
| `photo_url` | TEXT | Memorial photo (optional) |
| `planted_at` | TIMESTAMP | When tree was planted |
| `died_at` | TIMESTAMP | When tree died |
| `days_lived` | INTEGER | Total days the tree survived |
| `cause_of_death` | TEXT | Reason for tree death (optional) |
| `notes` | TEXT | User notes/memories (optional) |
| `created_at` | TIMESTAMP | When added to graveyard |

**Privacy**: Only visible to the tree owner (enforced by RLS policies).

## Achievements System

### Achievements (`achievements` table)

Available achievements in the system:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique achievement ID |
| `name` | TEXT | Achievement name (unique) |
| `description` | TEXT | Achievement description |
| `icon` | TEXT | Icon identifier |
| `xp_requirement` | INTEGER | XP needed to unlock |
| `created_at` | TIMESTAMP | Creation timestamp |

### Default Achievements

| Achievement | Description | XP Required | Icon |
|-------------|-------------|-------------|------|
| First Sprout | Plant your first tree | 0 | Sprout |
| Tree Collector | Plant 5 trees | 50 | TreePine |
| Forest Guardian | Plant 10 trees | 150 | Trees |
| XP Novice | Earn 100 XP | 100 | Award |
| XP Expert | Earn 500 XP | 500 | Trophy |
| Level 5 Guardian | Reach level 5 | 400 | Star |
| Consistent Caretaker | Complete 10 tasks | 100 | CheckCircle |
| Week Warrior | Log in for 7 consecutive days | 70 | Calendar |

### User Achievements (`user_achievements` table)

Junction table tracking which achievements users have unlocked:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | User who earned achievement |
| `achievement_id` | UUID | Achievement earned |
| `unlocked_at` | TIMESTAMP | When achievement was unlocked |

**Privacy**: User achievements are publicly viewable to encourage competition and recognition.

## Tasks & Care Activities (`tasks` table)

User tasks for tree maintenance:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Task ID |
| `tree_id` | UUID | Associated tree |
| `user_id` | UUID | Task owner |
| `task_type` | TEXT | Type (e.g., "water", "photo", "check") |
| `status` | TEXT | Status ("pending", "completed", "missed") |
| `scheduled_date` | DATE | When task is scheduled |
| `completed_at` | TIMESTAMP | When task was completed |
| `xp_reward` | INTEGER | XP earned for completion |
| `photo_url` | TEXT | Task photo (optional) |
| `notes` | TEXT | User notes (optional) |
| `created_at` | TIMESTAMP | Task creation timestamp |

**Privacy**: Tasks are only visible to the task owner.

## Neighborhood/Community Data

### Neighborhoods (`neighborhoods` table)

Community groups for competition:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Neighborhood ID |
| `name` | TEXT | Neighborhood name (unique) |
| `total_xp` | INTEGER | Combined XP of all members |
| `member_count` | INTEGER | Number of members |
| `created_at` | TIMESTAMP | Creation timestamp |

### User Neighborhoods (`user_neighborhoods` table)

Junction table for user-neighborhood membership:

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | UUID | Member user ID |
| `neighborhood_id` | UUID | Neighborhood ID |
| `joined_at` | TIMESTAMP | When user joined |

**Privacy**: Neighborhood memberships are publicly viewable.

## Privacy & Security

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Profiles**: Public profiles viewable by all; private profiles only by owner
- **Trees**: Viewable by all (respects profile privacy settings)
- **Tasks**: Only viewable by task owner
- **Tree Graveyard**: Only viewable by owner
- **Achievements**: Public (read-only for users)
- **User Achievements**: Publicly viewable
- **Neighborhoods**: Publicly viewable

### User Settings (Stored in localStorage)

Client-side preferences stored locally:
- `profileVisible`: Profile visibility toggle
- `treesVisible`: Trees visibility on public map
- `darkMode`: Theme preference
- `sfxEnabled`: Sound effects enabled
- `sfxVolume`: Sound effects volume (0-100)

## Summary: Complete User Data Checklist

✅ **Username** - `profiles.username`
✅ **Password** - Managed by Supabase Auth (`auth.users`)
✅ **UID** - `profiles.id` (references `auth.users.id`)
✅ **Profile Pic** - `profiles.avatar_url`
✅ **Adopted Trees** - `trees` table (private via RLS)
✅ **Achievements** - `achievements` + `user_achievements` tables
✅ **User Level** - `profiles.level`
✅ **Guardian Rank** - `profiles.guardian_rank`
✅ **Tree Graveyard** - `tree_graveyard` table
✅ **Profile Privacy Setting** - `profiles.profile_private`
✅ **Date Joined** - `profiles.created_at`
✅ **Total XP** - `profiles.total_xp`
✅ **Last Updated** - `profiles.updated_at`
✅ **Community Memberships** - `user_neighborhoods` table
✅ **Task History** - `tasks` table
✅ **Tree Care Data** - Geographic locations, health status, photos

## Related Documentation

- [Supabase Schema Migration](./supabase/migrations/)
- [TypeScript Types](./src/integrations/supabase/types.ts)
- [Profile Settings UI](./src/pages/Profile.tsx)
