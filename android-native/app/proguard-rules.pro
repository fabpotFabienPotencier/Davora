# Keep model classes used with Gson
-keep class com.davora.xyz.data.** { *; }

# OkHttp / Okio
-dontwarn okhttp3.**
-dontwarn okio.**

# Retrofit
-keepattributes Signature, Exceptions, Annotation
-keepclassmembers,allowshrinking,allowobfuscation interface * {
    @retrofit2.http.* <methods>;
}

# Markwon
-dontwarn io.noties.markwon.**

# Coroutines
-keepnames class kotlinx.coroutines.** { *; }
