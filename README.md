#download dependencies
yarn
#Run
yarn run dev



# How to run the project
yarn (install dependencies)
yarn run dev

###### CAPACITOR ######
## How to install capacitor
nvm use 20.11.1   (fatal error if you dont use node 20)
yarn add @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npx cap init
## How to add platforms
npx cap add android
npx cap add ios (not needed right now)
# How to run Capacitor to update the app
1. yarn build (without issues)
2. npx cap sync (to synchronize the actual updates in the web project)
3. npx cap open android (open the project in Android Studio)
4. npx cap open ios
5. npx cap run android
---- use this ip in the endpoints to listen in Android 
10.0.2.2
###### ELECTRON  #########
## how to install Electron
yarn add -D electron electron-builder concurrently wait-on
## how to synchronize
npx cap sync
## how to build for mac and linux
yarn dist (for production)
## how to run
yarn electron:build

## Depuracion
win.webContents.openDevTools();




## how to set up in local Android Mac M1 to listen endpoints in localhost (take off in production)

1. res/xml/network_security_config.xml ----(delete this file on prod)

<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>



2. in MainActivity    ----(delete oncreate on prod)

package com.ruku.rukupay;
import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WebView webView = (WebView) findViewById(R.id.webview);
        if (webView != null) {
            webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }
    }
}

3. res/layout/activity_main.xml  ----(delete +id/webview in prod)

<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</androidx.coordinatorlayout.widget.CoordinatorLayout>

4. add this configuration in the AndroidManifest.xml

 <application
        ...
        android:usesCleartextTraffic="true">



#### Work with the plugin terminal project
if you need to update the plugin you need to write code and after update the dist folder and sync the android app inside the plugin

1. to add the plugin to the app
yarn add ./stripeterminalkevinmorales

2. buil the plugin, inside the plugin folder
yarn build
3. sync the plugin if you add new code
npx cap sync android 