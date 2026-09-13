HabitFlow 🌱

HabitFlow is a motivation-focused Android habit and goal tracking app
designed to make consistency feel rewarding instead of repetitive.

Rather than presenting users with a plain checklist, HabitFlow combines
a calendar-first home screen, visual progress, streaks, XP, levels, an
expressive avatar, goals, sub-habits, reminders, and detailed
statistics.

Status: 🚧 In development
Platform: Android
Package: com.example.habitflow

✨ Features

🏠 Calendar-first Home

The Home screen is built around a monthly calendar rather than a
traditional dashboard.

View habit activity by month.

Swipe left/right to move between months.

Tap the month/year to jump directly to a month.

Future dates are visually greyed out.

Dates with no completed habits are greyed out.

Completed habits appear as small colored dots.

Each habit can have its own color.

Multiple completed habits can appear on the same date.

Tapping a date shows a quick summary first, with an option to open
full details.

Future months can only be viewed as far as existing habit schedules
extend.

🧍 Motivational Avatar

A small animated character lives below the calendar and reacts to the
user’s actual behavior.

The initial mood system includes:

😊 Happy

😟 Concerned

😢 Sad

🤩 Excited

🏆 Proud

The avatar:

Changes mood based on performance.

Displays one motivational message at a time.

Updates on important events and when the app is opened.

Uses personalized statistics, encouragement, and occasional playful
comments.

Randomizes messages when multiple messages are equally appropriate.

Acknowledges an absence only when scheduled habits were missed.

Uses animations for major events such as level-ups and goal
completion.

Can be tapped to see its current mood and why it has that mood.

The architecture should allow additional moods and avatar customization
to be added later.

✅ Habit Tracking

HabitFlow supports both simple yes/no habits and target-based habits.

Examples:

Read 20 pages

Exercise

Drink 2.5 L

Study 1.5 hours

Each habit supports:

Name

Frequency

Optional target

Unit

Reminder time

Habit color

Individual reminder toggle

Pause/resume

Completion history

Individual streak

Statistics

Yes/No habits

A yes/no habit has only:

Incomplete → Complete

There is no progress meter.

Target-based habits

Target-based habits support:

Decimal values

User-selected or custom units

Multiple progress entries per day

Adding an increment

Directly setting the current total

Going beyond the target

Manually completing the habit even below target

Permanent storage of partial progress

Example:

If the target is 20 pages and the user reaches 25:

20 / 20 + 5 extra

Extra progress is included in long-term statistics.

Reaching the target does not automatically complete the habit. The
user must explicitly mark it complete.

Partial progress is never discarded. If the day ends without completion,
the partial progress remains stored and the day is not treated as a
missed day.

🗓️ Habit Scheduling

Habit frequencies include:

Daily

Weekly

Monthly

Specific date

Weekly

Users can schedule habits using:

Specific weekdays, such as Monday/Wednesday/Friday

Specific calendar dates, such as the 7th, 13th, and 31st

Both approaches are supported.

Monthly

Selected date numbers repeat each month.

If a selected date does not exist in a month, the habit uses the last
day of that month.

Example:

31st → February 28/29, April 30

Specific dates

A habit can be scheduled for:

One specific date

Multiple specific dates

After the final scheduled date, the habit automatically moves to the
archived section while preserving its history.

⏸️ Pause & Resume

Habits can be paused either:

Until a specific resume date

For a chosen number of days

While paused:

No scheduled tasks are created.

No missed days are recorded.

The habit’s streak is protected.

No XP is earned because nothing is completed.

When resuming, HabitFlow asks the user to confirm the schedule before
the habit becomes active again.

🔔 Smart Reminders

Each habit can have reminders enabled or disabled individually.

The reminder sequence is:

Initial reminder at the selected time

+3 hours

+6 hours

+12 hours

Reminders stop when the scheduled day ends.

Notification actions:

Yes → mark the habit complete.

No → leave it incomplete and continue remaining reminders.

Not yet → leave it incomplete and continue remaining reminders.

Completing a habit before a reminder automatically cancels all remaining
reminders for that habit on that day.

The final reminder does not automatically mark a habit as missed. The
habit remains incomplete until the scheduled day ends.

🎯 Goals & Sub-habits

HabitFlow supports two types of organization:

Standalone habits

Big goals containing sub-habits

A goal groups smaller habits together and calculates overall progress
from the actual work completed in its sub-habits.

Goal progress

Goal progress is based on the actual amount of work completed, not
simply the number of completed sub-habits.

Example:

A goal containing:

Run 100 km

Read 500 pages

should evaluate progress according to actual progress toward those
targets.

The goal displays an overall percentage.

Shared sub-habits

A sub-habit can belong to multiple goals.

Completing or progressing that habit updates every connected goal
automatically.

Existing habits can also be connected to a new goal.

Goals cannot contain other goals. Only habits/sub-habits can be inside a
goal.

When creating a sub-habit inside a goal, the user chooses whether that
habit should also appear in the main Habits list.

Completing goals

When all required work reaches 100%:

The goal reaches 100%.

The avatar celebrates.

A larger XP reward is given.

A larger celebration screen is displayed.

The celebration includes animation, XP earned, and a goal summary.

The user is asked what should happen to the sub-habits.

Completing a goal also counts as activity for the overall streak that
day.

Reopening a completed goal creates a new version while preserving the
previous completed goal’s history.

🔥 Streaks

HabitFlow maintains:

Individual habit streaks

Overall streak

Individual streaks

Only scheduled days count.

For example, a habit scheduled on Monday, Wednesday, and Friday has a
streak of 3 after completing all three scheduled days.

Unscheduled days do not break the streak.

Each habit displays:

Current streak

Previous streak

Best streak

Overall streak

The overall streak continues when the user completes at least one
scheduled habit on a day.

If all active habits are paused, the overall streak remains protected
during the pause.

If there are no active habits with scheduled activity, the overall
streak pauses until an active scheduled habit exists again.

If an overall streak breaks, completing a habit later on that same
calendar day starts the new streak from that day.

The app shows:

Current overall streak

Previous overall streak

Best overall streak

🧊 Streak Freezes

Users start with 5 streak freezes.

A freeze can protect a missed scheduled day.

Rules:

Auto-use can be enabled or disabled.

One freeze protects the overall streak for the entire day regardless
of how many habits were missed.

The individual habit streak also remains protected.

The protected habit/day should clearly indicate that a freeze was
used.

Using a freeze gives 0 XP.

Leveling up automatically awards earned freezes.

There is no maximum storage limit.

If the user has zero freezes and a streak would otherwise break, the
streak is still protected for that one day.

When automatic freeze usage is disabled, the user has a fixed 24-hour
window after the missed day to manually use a freeze.

If a streak actually breaks, the app displays the broken streak and the
previous streak length.

⭐ XP & Levels

XP rewards are intentionally simple.

Standard XP

Every normally completed habit:

+1 XP

No XP

The following award no XP:

Streak freezes

Late completions

Goal XP

Completing a big goal gives a larger bonus based on the number of
sub-habits.

The reward:

Scales with goal size.

Has a reasonable cap.

Is clearly displayed to the user.

Example:

+25 XP Goal Bonus!

Leveling

Level requirements progressively increase rather than using a fixed
linear amount.

Level-ups:

Trigger a full-screen celebration.

Show the new level.

Show newly unlocked content.

Automatically add earned streak freezes.

Avatar customization and additional unlockables are planned for future
versions.

Achievements and badges are intentionally deferred from the first
version.

⏰ Late Completion

Users can complete any previous missed scheduled date.

Late completion:

Is explicitly recorded as late.

Gives 0 XP.

Does not repair or extend the original streak.

Preserves the historical record.

📊 Statistics

The first version uses numbers and summaries rather than charts.

Statistics are all-time only.

Overall statistics

The app displays:

Total habits completed

Total days completed

Total missed days

Overall completion rate

Best overall streak

Total XP earned

Goals completed

Total extra progress beyond targets

Per-habit statistics

Each habit has its own statistics without ranking habits against each
other.

Statistics can include:

Completion rate

Total completions

Missed days

Progress achieved

Extra progress

Current streak

Previous streak

Best streak

Other useful habit-specific totals

📦 Archive & Restore

Habits and goals can be archived while preserving their historical data.

Archived habits

Archived habits:

Are removed from the active list.

Keep all history and statistics.

Appear in a dedicated Archived section.

Can be restored.

Restoring an archived habit requires the user to confirm/set:

Schedule

Target

A restored habit starts a new streak at 0.

Its old history and XP remain connected to the same habit record.

Archived goals

Ending/deleting a big goal archives:

The goal

Its sub-habits

All history and statistics are preserved.

The goal can be restored later.

There is no search functionality for archived items.

🗑️ Deletion

Deleting a standalone habit requires confirmation.

The confirmation clearly explains that:

The habit will disappear from the active list.

Historical data and statistics will be preserved.

Ending/deleting a big goal requires confirmation explaining that:

The goal and sub-habits will be archived.

History and statistics will be preserved.

The user can restore them later.

There is no “Reset All Data” option in V1.

🧭 Navigation

The bottom navigation contains three sections:

Home

Habits

Account / Settings

Home

Contains:

Monthly calendar

Habit completion history

Avatar and message bubble

XP/level indicator

Habits

Contains:

Active habits

Habits grouped by goal

Standalone habits

Today’s completion state

Archived Habits

Add Habit button

Example:

📚 Read 20 pages       ☑
🏃 Exercise             ☐
💧 Drink water          ☑

Clicking a habit opens its detailed view with its calendar, progress,
streaks, and statistics.

Both Home and Habits contain a large + button for creating a habit.

Account / Settings

Contains:

Avatar and unlocked items

Statistics

Notifications

Appearance

Data / Backup

About

🎨 Visual Design

The design should be a balanced combination of:

Clean/minimal foundation

Playful visual accents

Character animation

Motivational feedback

The interface should avoid feeling like a sterile spreadsheet while also
avoiding an overly cluttered or childish appearance.

The avatar provides much of the personality.

Theme

V1 supports:

Light mode

Dark mode

No system-following theme is required.

Sound

There are no sound effects in V1.

Celebrations and feedback are visual only.

💾 Data & Backup

V1 is phone-only.

Core data is stored locally on the device.

The app should automatically create local backups.

V1 does not need:

User accounts

Login

Cloud sync

Cross-device recovery

Recovery after reinstalling the app

However, the underlying architecture should be designed so online/cloud
syncing can be added later without requiring the entire data layer to be
rebuilt.

🛠️ Error Handling

When an operation such as saving or updating data fails:

Automatically retry the operation.

If it still fails, show a simple, understandable error message.

Avoid exposing unnecessary technical details to normal users.

Example:

Something went wrong. Please try again.

🧱 Architecture Principles

HabitFlow should be built with a maintainable structure suitable for
future expansion.

The first version should focus on the core experience while keeping the
foundation flexible enough for future features such as:

Cloud backup

Online synchronization

Widgets

Additional themes

Advanced statistics

Achievements/badges

More avatar moods

Avatar customization

Additional unlockables

Avoid building temporary shortcuts that would require a complete rewrite
when these features are introduced.

Keep business rules separate from UI code wherever practical.

All important historical events should be stored as data rather than
derived only from the current UI state.

📱 V1 Scope

The first release should prioritize:

Core

Habit creation

Habit editing

Habit deletion

Habit completion

Partial progress

Habit scheduling

Pause/resume

Reminders

Late completion

Archive/restore

Goals

Sub-habits

Shared sub-habits

Streaks

Streak freezes

XP

Levels

Avatar moods

Calendar history

Statistics

Automatic local backups

Light/dark themes

Deliberately deferred

The following are designed for future versions:

Cloud synchronization

User accounts

Widgets

Advanced chart-based analytics

Achievements/badges

Extensive avatar customization

Multiple avatar designs

Additional themes

Other advanced unlockables

🚀 Getting Started

Requirements

Android Studio

Android SDK

Kotlin

A recent Android SDK compatible with the project

Package

com.example.habitflow

Build

Clone the repository:

git clone <repository-url>

Open the project in Android Studio, allow Gradle to synchronize, then
run the application on an Android emulator or physical Android device.

🗂️ Project Structure

The project should keep major responsibilities separated.

A suggested structure:

com.example.habitflow
├── data
│   ├── model
│   ├── local
│   └── repository
├── domain
│   ├── model
│   └── usecase
├── ui
│   ├── home
│   ├── habits
│   ├── goals
│   ├── statistics
│   ├── settings
│   └── components
├── notifications
└── utils

The exact implementation can evolve, but the separation between data,
business logic, and UI should remain clear.

🗺️ Roadmap

V1

Product behavior defined

Core Android project

Local data storage

Habit creation and tracking

Calendar

Goals and sub-habits

Streak system

XP and levels

Avatar feedback

Notifications

Statistics

Automatic local backups

Light/dark themes

Testing and polish

Future

Cloud synchronization

Cross-device support

Avatar customization

More avatar moods

Widgets

Achievements and badges

Advanced statistics

More themes

Additional unlockables

🤝 Contributing

Contributions are welcome as HabitFlow evolves.

When contributing:

Keep the existing architecture organized.

Avoid mixing business logic directly into UI components.

Preserve existing historical data behavior.

Do not change streak, XP, reminder, or completion rules without
documenting the change.

Test edge cases, especially scheduling, missed days, pauses,
freezes, partial progress, and late completion.

📄 License

License information will be added to the project.

💡 Philosophy

HabitFlow is built around a simple idea:

Tracking a habit should feel like making progress, not maintaining a
spreadsheet.

The calendar shows the journey, the statistics show the long-term
picture, and the avatar gives the experience a little personality.

Small actions. Visible progress. Better consistency. 🌱
