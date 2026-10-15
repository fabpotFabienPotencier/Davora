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
import com.davora.xyz.data.SignupRequest
import com.davora.xyz.databinding.ActivitySignupBinding
import com.davora.xyz.ui.chat.MainActivity
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.launch

class SignupActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySignupBinding
    private val session by lazy { (application as DavoraApp).sessionManager }
    private val credentialManager by lazy { CredentialManager.create(this) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignupBinding.inflate(layoutInflater)
        setContentView(binding.root)

        loadRemoteConfig()

        binding.btnSignup.setOnClickListener { doSignup() }
        binding.btnGoogle.setOnClickListener { doGoogleSignIn() }
        binding.tvGoLogin.setOnClickListener { finish() }
    }

    private fun loadRemoteConfig() {
        lifecycleScope.launch {
            try {
                val res = ApiClient.api.config()
                if (res.isSuccessful) {
                    res.body()?.googleClientId?.let { session.googleClientId = it }
                }
            } catch (_: Exception) { }
        }
    }

    private fun doSignup() {
        val email = binding.etEmail.text.toString().trim()
        val password = binding.etPassword.text.toString()

        if (!binding.cbTerms.isChecked) {
            showError(getString(R.string.agree_terms))
            return
        }
        if (email.isEmpty() || password.length < 6) {
            showError(getString(R.string.error_generic))
            return
        }
        setLoading(true)
        lifecycleScope.launch {
            try {
                val res = ApiClient.api.signup(SignupRequest(email, password))
                val body = res.body()
                when {
                    res.isSuccessful && body?.accessToken == "verify_email" -> {
                        Toast.makeText(
                            this@SignupActivity,
                            "Verification email sent. Please check your inbox.",
                            Toast.LENGTH_LONG
                        ).show()
                        finish()
                    }
                    res.isSuccessful && !body?.accessToken.isNullOrBlank() -> {
                        session.token = body!!.accessToken
                        session.email = body.email ?: email
                        openChat()
                    }
                    else -> showError(body?.detail ?: getString(R.string.error_generic))
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
                val result = credentialManager.getCredential(this@SignupActivity, request)
                val googleCredential = GoogleIdTokenCredential.createFrom(result.credential.data)
                exchangeGoogleToken(googleCredential.idToken)
            } catch (e: GetCredentialException) {
                setLoading(false)
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
        finishAffinity()
    }

    private fun setLoading(loading: Boolean) {
        binding.progressBar.visibility = if (loading) View.VISIBLE else View.GONE
        binding.btnSignup.isEnabled = !loading
        binding.btnGoogle.isEnabled = !loading
    }

    private fun showError(msg: String) {
        binding.tvError.text = msg
        binding.tvError.visibility = View.VISIBLE
    }
}
