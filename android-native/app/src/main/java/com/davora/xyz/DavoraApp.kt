package com.davora.xyz

import android.app.Application
import com.davora.xyz.data.SessionManager

class DavoraApp : Application() {

    lateinit var sessionManager: SessionManager
        private set

    override fun onCreate() {
        super.onCreate()
        sessionManager = SessionManager(this)
    }
}
