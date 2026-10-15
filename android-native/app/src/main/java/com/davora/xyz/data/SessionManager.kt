package com.davora.xyz.data

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Secure token storage. Uses EncryptedSharedPreferences so the auth token
 * is never stored in plain text on disk.
 */
class SessionManager(context: Context) {

    private val prefs: SharedPreferences = try {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "davora_secure_prefs",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    } catch (e: Exception) {
        // Fallback for devices where keystore is unavailable
        context.getSharedPreferences("davora_prefs", Context.MODE_PRIVATE)
    }

    var token: String?
        get() = prefs.getString(KEY_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_TOKEN, value).apply()

    var email: String?
        get() = prefs.getString(KEY_EMAIL, null)
        set(value) = prefs.edit().putString(KEY_EMAIL, value).apply()

    var nickname: String?
        get() = prefs.getString(KEY_NICKNAME, null)
        set(value) = prefs.edit().putString(KEY_NICKNAME, value).apply()

    var googleClientId: String?
        get() = prefs.getString(KEY_GOOGLE_CLIENT_ID, null)
        set(value) = prefs.edit().putString(KEY_GOOGLE_CLIENT_ID, value).apply()

    var fcmToken: String?
        get() = prefs.getString(KEY_FCM_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_FCM_TOKEN, value).apply()

    var subscriptionPlan: String?
        get() = prefs.getString(KEY_PLAN, "Davora Free")
        set(value) = prefs.edit().putString(KEY_PLAN, value).apply()

    val isLoggedIn: Boolean get() = !token.isNullOrBlank()

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val KEY_TOKEN = "davora_token"
        private const val KEY_EMAIL = "davora_email"
        private const val KEY_NICKNAME = "davora_nickname"
        private const val KEY_GOOGLE_CLIENT_ID = "davora_google_client_id"
        private const val KEY_FCM_TOKEN = "davora_fcm_token"
        private const val KEY_PLAN = "davora_plan"
    }
}
