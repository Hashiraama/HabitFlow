# HabitFlow ProGuard / R8 Rules

# Capacitor Framework & Plugins
-keep class com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod public *;
}

# Preserve JavaScript Interfaces
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod

# WebView Javascript interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# AndroidX Core & Navigation
-keep class androidx.core.app.** { *; }
-keep class androidx.core.content.** { *; }
-keep class androidx.appcompat.** { *; }

# Keep App Specific Classes
-keep class com.habitflow.app.** { *; }
