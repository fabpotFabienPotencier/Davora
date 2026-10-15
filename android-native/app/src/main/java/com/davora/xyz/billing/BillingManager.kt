package com.davora.xyz.billing

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.davora.xyz.data.ApiClient
import com.davora.xyz.data.VerifyPurchaseRequest
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Google Play Billing (subscriptions) — Davora Basic / Pro / Premium.
 * Purchases are verified with the Davora backend before unlocking.
 */
class BillingManager(
    context: Context,
    private val authToken: () -> String?,
    private val onPlanActivated: (String) -> Unit,
    private val onError: (String) -> Unit
) : PurchasesUpdatedListener {

    companion object {
        val PRODUCT_IDS = listOf("davora_basic", "davora_pro", "davora_premium")
    }

    private val client = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases(
            com.android.billingclient.api.PendingPurchasesParams.newBuilder()
                .enableOneTimeProducts()
                .build()
        )
        .build()

    private var products: List<ProductDetails> = emptyList()

    fun connect(onReady: () -> Unit = {}) {
        client.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryProducts()
                    onReady()
                } else {
                    onError("Billing unavailable: ${result.debugMessage}")
                }
            }
            override fun onBillingServiceDisconnected() { /* will retry on next purchase attempt */ }
        })
    }

    private fun queryProducts() {
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                PRODUCT_IDS.map { id ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(id)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                }
            )
            .build()
        client.queryProductDetailsAsync(params) { _, details ->
            products = details
        }
    }

    fun launchPurchase(activity: Activity, productId: String) {
        val details = products.firstOrNull { it.productId == productId }
        if (details == null) {
            onError("Plan not available yet. Please try again later.")
            return
        }
        val offerToken = details.subscriptionOfferDetails?.firstOrNull()?.offerToken
        if (offerToken == null) {
            onError("No offer available for this plan.")
            return
        }
        val params = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(
                listOf(
                    BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(details)
                        .setOfferToken(offerToken)
                        .build()
                )
            )
            .build()
        client.launchBillingFlow(activity, params)
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        if (result.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            purchases.forEach { handlePurchase(it) }
        } else if (result.responseCode != BillingClient.BillingResponseCode.USER_CANCELED) {
            onError("Purchase failed: ${result.debugMessage}")
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        if (purchase.purchaseState != Purchase.PurchaseState.PURCHASED) return

        // Acknowledge so Google doesn't auto-refund
        if (!purchase.isAcknowledged) {
            val ack = AcknowledgePurchaseParams.newBuilder()
                .setPurchaseToken(purchase.purchaseToken)
                .build()
            client.acknowledgePurchase(ack) { }
        }

        // Verify with Davora backend, then unlock
        val productId = purchase.products.firstOrNull() ?: return
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val res = ApiClient.api.verifyPurchase(
                    ApiClient.bearer(authToken()),
                    VerifyPurchaseRequest(
                        purchaseToken = purchase.purchaseToken,
                        productId = productId,
                        packageName = "com.davora.xyz"
                    )
                )
                if (res.isSuccessful) {
                    val planName = when (productId) {
                        "davora_basic" -> "Davora Basic"
                        "davora_pro" -> "Davora Pro"
                        "davora_premium" -> "Davora Premium"
                        else -> productId
                    }
                    onPlanActivated(planName)
                } else {
                    onError("Purchase verification failed on server.")
                }
            } catch (e: Exception) {
                onError("Could not verify purchase. Check connection.")
            }
        }
    }

    fun destroy() {
        if (client.isReady) client.endConnection()
    }
}
