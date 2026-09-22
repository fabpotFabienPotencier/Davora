import os
import re

def patch_native_purchases():
    target_files = []
    for search_dir in ["node_modules", "android"]:
        if os.path.exists(search_dir):
            for root, dirs, files in os.walk(search_dir):
                for file in files:
                    if file == "NativePurchasesPlugin.java":
                        target_files.append(os.path.join(root, file))

    if not target_files:
        print("Note: NativePurchasesPlugin.java not found to patch.")
        return

    for plugin_path in set(target_files):
        print(f"Patching {plugin_path} for Play Billing 8 compatibility...")
        with open(plugin_path, "r", encoding="utf-8") as f:
            plugin_code = f.read()

        # Fix 1: enablePendingPurchases() requires PendingPurchasesParams in Billing 8
        plugin_code = re.sub(
            r'\.enablePendingPurchases\(\)',
            '.enablePendingPurchases(com.android.billingclient.api.PendingPurchasesParams.newBuilder().enableOneTimeProducts().build())',
            plugin_code
        )

        # Fix 2: onProductDetailsResponse signature changed to (BillingResult, QueryProductDetailsResult) in Billing 8
        old_sig = re.compile(r'public\s+void\s+onProductDetailsResponse\s*\(\s*BillingResult\s+([^,]+)\s*,\s*List<ProductDetails>\s+([^)]+)\s*\)\s*\{')
        plugin_code = old_sig.sub(
            r'public void onProductDetailsResponse(BillingResult \1, com.android.billingclient.api.QueryProductDetailsResult _qRes) {\n                    List<ProductDetails> \2 = _qRes.getProductDetailsList();',
            plugin_code
        )

        with open(plugin_path, "w", encoding="utf-8") as f:
            f.write(plugin_code)
        print(f"Successfully patched {plugin_path} for Play Billing 8!")

def main():
    print("--- Starting Android Project Configuration ---")

    # 1. Update Version Code and Name
    run_num = os.environ.get("GITHUB_RUN_NUMBER", "1")
    version_code = 500 + int(run_num)
    print(f"Setting unique versionCode to {version_code} and versionName to 2.5.0")
    
    app_gradle_path = "android/app/build.gradle"
    if os.path.exists(app_gradle_path):
        with open(app_gradle_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        content = re.sub(r'versionCode\s+\d+', f'versionCode {version_code}', content)
        content = re.sub(r'versionName\s+"[^"]+"', 'versionName "2.5.0"', content)
        
        # Ensure Play Billing 8.0.0 is explicitly in app dependencies
        if "com.android.billingclient:billing" not in content:
            dep_block = (
                "\n    implementation 'com.android.billingclient:billing:8.0.0'\n"
                "    implementation 'com.android.billingclient:billing-ktx:8.0.0'\n"
            )
            content = re.sub(r'(dependencies\s*\{)', r'\1' + dep_block, content, count=1)
            print("Added Play Billing 8.0.0 dependencies to app/build.gradle")
        
        with open(app_gradle_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {app_gradle_path}")
    else:
        print(f"Warning: {app_gradle_path} not found")

    # 2. Update SDK versions in variables.gradle (API 36)
    var_gradle_path = "android/variables.gradle"
    if os.path.exists(var_gradle_path):
        with open(var_gradle_path, "r", encoding="utf-8") as f:
            var_content = f.read()
        
        var_content = re.sub(r'compileSdkVersion\s*=\s*\d+', 'compileSdkVersion = 36', var_content)
        var_content = re.sub(r'targetSdkVersion\s*=\s*\d+', 'targetSdkVersion = 36', var_content)
        
        with open(var_gradle_path, "w", encoding="utf-8") as f:
            f.write(var_content)
        print(f"Updated {var_gradle_path} to SDK 36")
    else:
        print(f"Warning: {var_gradle_path} not found")

    # 3. Update AGP version & Force Billing 8.0.0 in root build.gradle
    root_gradle_path = "android/build.gradle"
    if os.path.exists(root_gradle_path):
        with open(root_gradle_path, "r", encoding="utf-8") as f:
            root_content = f.read()
        
        root_content = re.sub(r"classpath\s+['\"]com\.android\.tools\.build:gradle:[^'\"]+['\"]",
                              "classpath 'com.android.tools.build:gradle:8.5.0'", root_content)
        
        resolution_strategy = """
allprojects {
    configurations.all {
        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk8'
        exclude group: 'org.jetbrains.kotlin', module: 'kotlin-stdlib-jdk7'
        resolutionStrategy {
            force 'com.android.billingclient:billing:8.0.0'
            force 'com.android.billingclient:billing-ktx:8.0.0'
        }
    }
}
"""
        if "resolutionStrategy" not in root_content:
            root_content += resolution_strategy
            print("Appended Play Billing 8.0.0 resolutionStrategy to root build.gradle")
            
        with open(root_gradle_path, "w", encoding="utf-8") as f:
            f.write(root_content)
        print(f"Updated {root_gradle_path}")
    else:
        print(f"Warning: {root_gradle_path} not found")

    # 4. Update Gradle wrapper to 8.7
    wrapper_path = "android/gradle/wrapper/gradle-wrapper.properties"
    if os.path.exists(wrapper_path):
        with open(wrapper_path, "r", encoding="utf-8") as f:
            wrapper_content = f.read()
        wrapper_content = re.sub(r'gradle-[\d\.]+-all\.zip', 'gradle-8.7-all.zip', wrapper_content)
        wrapper_content = re.sub(r'gradle-[\d\.]+-bin\.zip', 'gradle-8.7-all.zip', wrapper_content)
        with open(wrapper_path, "w", encoding="utf-8") as f:
            f.write(wrapper_content)
        print(f"Updated Gradle wrapper to 8.7")
    else:
        print(f"Warning: {wrapper_path} not found")

    # 5. Add suppressUnsupportedCompileSdk to gradle.properties
    props_path = "android/gradle.properties"
    prop_line = "\nandroid.suppressUnsupportedCompileSdk=36\n"
    if os.path.exists(props_path):
        with open(props_path, "r", encoding="utf-8") as f:
            props = f.read()
        if "android.suppressUnsupportedCompileSdk" not in props:
            with open(props_path, "a", encoding="utf-8") as f:
                f.write(prop_line)
            print("Added android.suppressUnsupportedCompileSdk=36 to gradle.properties")
    else:
        with open(props_path, "w", encoding="utf-8") as f:
            f.write(prop_line)
        print("Created gradle.properties with android.suppressUnsupportedCompileSdk=36")

    # 6. Ensure Manifest permissions
    manifest_path = "android/app/src/main/AndroidManifest.xml"
    if os.path.exists(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_content = f.read()
        
        perms = [
            '<uses-permission android:name="android.permission.RECORD_AUDIO" />',
            '<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />'
        ]
        to_add = [p for p in perms if p not in manifest_content]
        if to_add:
            insert_str = "    " + "\n    ".join(to_add) + "\n"
            manifest_content = manifest_content.replace("<application", insert_str + "<application")
            with open(manifest_path, "w", encoding="utf-8") as f:
                f.write(manifest_content)
            print("Added permissions to AndroidManifest.xml")
    else:
        print(f"Warning: {manifest_path} not found")

    # 7. Patch @capgo/native-purchases for Play Billing 8 compatibility
    patch_native_purchases()

    print("--- Android Project Configuration Complete ---")

if __name__ == "__main__":
    main()
