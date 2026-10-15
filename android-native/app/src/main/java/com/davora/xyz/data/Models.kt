package com.davora.xyz.data

import com.google.gson.annotations.SerializedName

// ── Auth ──
data class LoginRequest(val email: String, val password: String)
data class SignupRequest(val email: String, val password: String)
data class GoogleAuthRequest(val credential: String)

data class AuthResponse(
    @SerializedName("access_token") val accessToken: String?,
    val email: String? = null,
    val detail: String? = null,
    @SerializedName("requires_2fa") val requires2fa: Boolean = false
)

// ── Remote config ──
data class RemoteConfig(
    @SerializedName("logo_url") val logoUrl: String? = null,
    @SerializedName("platform_name") val platformName: String? = null,
    @SerializedName("google_client_id") val googleClientId: String? = null,
    @SerializedName("terms_url") val termsUrl: String? = null,
    @SerializedName("privacy_url") val privacyUrl: String? = null
)

// ── Chat ──
data class ChatMessage(
    val id: Long = System.currentTimeMillis(),
    val role: String, // "user" | "ai"
    var content: String,
    var isStreaming: Boolean = false,
    var imageUrl: String? = null
)

data class ChatSession(
    val id: String,
    var title: String?,
    val messages: MutableList<ChatMessage> = mutableListOf()
)

// WebSocket outgoing payload — mirrors the web app's contract
data class WsChatPayload(
    val message: String,
    val history: List<Map<String, String>>,
    val mode: String = "instant",
    val model: String = "Davora 3.2 Pro",
    val isTemporary: Boolean = false,
    val nickname: String? = null,
    val token: String
)

// Quota error frame from the socket
data class QuotaError(
    @SerializedName("quota_error") val quotaError: String? = null,
    @SerializedName("wait_hours") val waitHours: Double? = null
)

// ── Sessions API ──
data class SessionCreateRequest(val title: String, val messages: List<ChatMessage>)

// ── Password ──
data class ChangePasswordRequest(
    @SerializedName("old_password") val oldPassword: String,
    @SerializedName("new_password") val newPassword: String
)

// ── Billing verify ──
data class VerifyPurchaseRequest(
    @SerializedName("purchase_token") val purchaseToken: String,
    @SerializedName("product_id") val productId: String,
    @SerializedName("package_name") val packageName: String
)

// ── Push ──
data class PushSubscribeRequest(val token: String)

data class GenericResponse(val detail: String? = null, val status: String? = null)
