package com.davora.xyz.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import androidx.lifecycle.lifecycleScope
import com.davora.xyz.DavoraApp
import com.davora.xyz.R
import com.davora.xyz.data.ApiClient
import com.davora.xyz.data.GoogleAuthRequest
import com.davora.xyz.data.LoginRequest
import com.davora.xyz.databinding.ActivityLoginBinding
import com.davora.xyz.ui.chat.MainActivity
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private val session by lazy { (application as DavoraApp).sessionManager }
    private val credentialManager by lazy { CredentialManager.create(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Already logged in? Go straight to chat.
        if (session.isLoggedIn) {
            openChat()
            return
        }

        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadRemoteConfig()

        binding.btnLogin.setOnClickListener { doLogin() }
        binding.btnGoogle.setOnClickListener { doGoogleSignIn() }
        binding.tvGoSignup.setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }

    private fun loadRemoteConfig() {
        lifecycleScope.launch {
            try {
                val res = ApiClient.api.config()
                if (res.isSuccessful) {
                    res.body()?.googleClientId?.let { session.googleClientId = it }
                }
            } catch (_: Exception) { /* config is optional at login screen */ }
        }
    }

    private fun doLogin() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()
        if (email.isEmpty() || password.isEmpty()) {
            showError(getString(R.string.error_generic))
            return
        }
        setLoading(true)
        lifecycleScope.launch {
            try {
                val res = ApiClient.api.login(LoginRequest(email, password))
                val body = res.body()
                if (res.isSuccessful && !body?.accessToken.isNullOrBlank()) {
                    session.token = body!!.accessToken
                    session.email = body.email ?: email
                    openChat()
                } else {
                    showError(body?.detail ?: getString(R.string.error_login))
                }
            } catch (e: Exception) {
                showError(getString(R.string.error_network))
            } finally {
                setLoading(false)
            }
        }
    }

    private fun doGoogleSignIn() {
        val clientId = session.googleClientId
        if (clientId.isNullOrBlank()) {
            Toast.makeText(this, "Google sign-in is not configured yet", Toast.LENGTH_SHORT).show()
            return
        }
        setLoading(true)
        lifecycleScope.launch {
            try {
                val googleIdOption = GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(clientId)
                    .build()
                val request = GetCredentialRequest.Builder()
                    .addCredentialOption(googleIdOption)
                    .build()
                val result = credentialManager.getCredential(this@LoginActivity, request)
                val googleCredential = GoogleIdTokenCredential.createFrom(result.credential.data)
                exchangeGoogleToken(googleCredential.idToken)
            } catch (e: GetCredentialException) {
                setLoading(false)
                // User cancelled — stay silent
            } catch (e: Exception) {
                setLoading(false)
                showError(getString(R.string.error_generic))
            }
        }
    }

    private suspend fun exchangeGoogleToken(idToken: String) {
        try {
            val res = ApiClient.api.googleAuth(GoogleAuthRequest(idToken))
            val body = res.body()
            if (res.isSuccessful && !body?.accessToken.isNullOrBlank()) {
                session.token = body!!.accessToken
                session.email = body.email
                openChat()
            } else {
                showError(body?.detail ?: getString(R.string.error_generic))
            }
        } catch (e: Exception) {
            showError(getString(R.string.error_network))
        } finally {
            setLoading(false)
        }
    }

    private fun openChat() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun setLoading(loading: Boolean) {
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        binding.btnLogin.isEnabled = !loading
        binding.btnGoogle.isEnabled = !loading
    }

    private fun showError(msg: String) {
        binding.tvError.text = msg
        binding.tvError.visibility = View.VISIBLE
    }
}
