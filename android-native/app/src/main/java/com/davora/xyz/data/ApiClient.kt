package com.davora.xyz.data

import okhttp3.OkHttpClient
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path
import java.util.concurrent.TimeUnit

interface DavoraApi {

    @POST("api/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("api/signup")
    suspend fun signup(@Body body: SignupRequest): Response<AuthResponse>

    @POST("api/auth/google")
    suspend fun googleAuth(@Body body: GoogleAuthRequest): Response<AuthResponse>

    @GET("api/config")
    suspend fun config(): Response<RemoteConfig>

    @GET("api/sessions")
    suspend fun sessions(@Header("Authorization") bearer: String): Response<List<ChatSession>>

    @POST("api/sessions")
    suspend fun createSession(
        @Header("Authorization") bearer: String,
        @Body body: SessionCreateRequest
    ): Response<GenericResponse>

    @DELETE("api/sessions/{id}")
    suspend fun deleteSession(
        @Header("Authorization") bearer: String,
        @Path("id") id: String
    ): Response<GenericResponse>

    @POST("api/change-password")
    suspend fun changePassword(
        @Header("Authorization") bearer: String,
        @Body body: ChangePasswordRequest
    ): Response<GenericResponse>

    @POST("api/subscription/verify-google")
    suspend fun verifyPurchase(
        @Header("Authorization") bearer: String,
        @Body body: VerifyPurchaseRequest
    ): Response<GenericResponse>

    @POST("api/notifications/subscribe")
    suspend fun subscribePush(
        @Header("Authorization") bearer: String,
        @Body body: PushSubscribeRequest
    ): Response<GenericResponse>
}

object ApiClient {

    private const val BASE_URL = "https://api.davora.xyz/"

    private val okHttp: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(20, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build()
    }

    val api: DavoraApi by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttp)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(DavoraApi::class.java)
    }

    fun bearer(token: String?) = "Bearer ${token.orEmpty()}"
}
