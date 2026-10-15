package com.davora.xyz.ui.settings

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.davora.xyz.DavoraApp
import com.davora.xyz.R
import com.davora.xyz.billing.BillingManager
import com.davora.xyz.data.ApiClient
import com.davora.xyz.data.ChangePasswordRequest
import com.davora.xyz.databinding.ActivitySettingsBinding
import com.davora.xyz.databinding.DialogUpgradeBinding
import com.davora.xyz.ui.auth.LoginActivity
import kotlinx.coroutines.launch

class SettingsActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySettingsBinding
    private val session by lazy { (application as DavoraApp).sessionManager }
    private var billing: BillingManager? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySettingsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.etNickname.setText(session.nickname.orEmpty())
        binding.tvSubscription.text = session.subscriptionPlan ?: "Davora Free"

        binding.etNickname.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) session.nickname = binding.etNickname.text.toString().trim()
        }

        binding.btnUpgrade.setOnClickListener { showUpgradeDialog() }
        binding.btnChangePassword.setOnClickListener { changePassword() }
        binding.btnLogout.setOnClickListener { logout() }

        initBilling()

        if (intent.getBooleanExtra("open_upgrade", false)) {
            showUpgradeDialog()
        }
    }

    private fun initBilling() {
        billing = BillingManager(
            context = this,
            authToken = { session.token },
            onPlanActivated = { plan ->
                session.subscriptionPlan = plan
                runOnUiThread {
                    binding.tvSubscription.text = plan
                    Toast.makeText(this, "$plan activated!", Toast.LENGTH_LONG).show()
                }
            },
            onError = { msg -> runOnUiThread { Toast.makeText(this, msg, Toast.LENGTH_LONG).show() } }
        ).also { it.connect() }
    }

    private fun showUpgradeDialog() {
        val dialogBinding = DialogUpgradeBinding.inflate(layoutInflater)
        val dialog = AlertDialog.Builder(this)
            .setView(dialogBinding.root)
            .create()
        dialog.window?.setBackgroundDrawableResource(R.drawable.bg_bubble_user)

        dialogBinding.btnBasic.setOnClickListener {
            billing?.launchPurchase(this, "davora_basic"); dialog.dismiss()
        }
        dialogBinding.btnPro.setOnClickListener {
            billing?.launchPurchase(this, "davora_pro"); dialog.dismiss()
        }
        dialogBinding.btnPremium.setOnClickListener {
            billing?.launchPurchase(this, "davora_premium"); dialog.dismiss()
        }

        dialog.show()
    }

    private fun changePassword() {
        val oldPass = binding.etOldPassword.text.toString()
        val newPass = binding.etNewPassword.text.toString()
        if (oldPass.isEmpty() || newPass.length < 6) {
            Toast.makeText(this, "New password must be at least 6 characters", Toast.LENGTH_SHORT).show()
            return
        }
        lifecycleScope.launch {
            try {
                val res = ApiClient.api.changePassword(
                    ApiClient.bearer(session.token),
                    ChangePasswordRequest(oldPass, newPass)
                )
                if (res.isSuccessful) {
                    Toast.makeText(this@SettingsActivity, "Password updated", Toast.LENGTH_SHORT).show()
                    binding.etOldPassword.text.clear()
                    binding.etNewPassword.text.clear()
                } else {
                    Toast.makeText(this@SettingsActivity, getString(R.string.error_generic), Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@SettingsActivity, getString(R.string.error_network), Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun logout() {
        session.clear()
        startActivity(Intent(this, LoginActivity::class.java))
        finishAffinity()
    }

    override fun onDestroy() {
        billing?.destroy()
        super.onDestroy()
    }
}
