package br.fenix.center;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView wv;
    private static final String FENIX_PKG = "br.fenix.estetica";

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        wv.setWebViewClient(new WebViewClient());
        wv.addJavascriptInterface(new Ponte(), "FenixCenterApp");
        // downloads (APKs e ZIPs) vão pro navegador do sistema instalar
        wv.setDownloadListener(new android.webkit.DownloadListener() {
            public void onDownloadStart(String url, String ua, String cd, String mime, long len) {
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) {}
            }
        });
        setContentView(wv);
        wv.loadUrl("file:///android_asset/www/index.html");
    }

    private class Ponte {
        @JavascriptInterface public String statusFenix() {
            try { return getPackageManager().getLaunchIntentForPackage(FENIX_PKG) != null ? "1" : "0"; }
            catch (Exception e) { return "0"; }
        }
        @JavascriptInterface public void abrirFenix() {
            runOnUiThread(new Runnable() { public void run() {
                try {
                    Intent i = getPackageManager().getLaunchIntentForPackage(FENIX_PKG);
                    if (i != null) { i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); startActivity(i); return; }
                } catch (Exception e) {}
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("fenix://abrir"))); } catch (Exception e2) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + FENIX_PKG))); } catch (Exception e3) {}
                }
            }});
        }
        @JavascriptInterface public boolean temFenix() { return statusFenix().equals("1"); }
    }

    @Override public void onBackPressed() {
        if (wv != null && wv.canGoBack()) wv.goBack(); else super.onBackPressed();
    }
}
