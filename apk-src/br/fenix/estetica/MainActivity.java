package br.fenix.estetica;

import android.app.Activity;
import android.app.DownloadManager;
import android.app.NotificationManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class MainActivity extends Activity {
    private WebView wv;
    private ValueCallback<Uri[]> fileCb;
    private static final int RC_FILE = 1;
    private static final int RC_PERM = 2;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        wv = new WebView(this);
        WebSettings s = wv.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        wv.setWebViewClient(new WebViewClient());
        wv.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCb != null) { try { fileCb.onReceiveValue(null); } catch (Exception e) {} }
                fileCb = cb;
                try {
                    Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                    i.addCategory(Intent.CATEGORY_OPENABLE);
                    i.setType("*/*");
                    startActivityForResult(Intent.createChooser(i, "Escolher arquivo"), RC_FILE);
                } catch (Exception e) { fileCb = null; return false; }
                return true;
            }
            @Override public void onPermissionRequest(final PermissionRequest r) {
                runOnUiThread(new Runnable() { public void run() { try { r.grant(r.getResources()); } catch (Exception e) {} } });
            }
        });
        wv.setDownloadListener(new android.webkit.DownloadListener() {
            public void onDownloadStart(String u, String ua, String cd, String mime, long len) {
                try {
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(u));
                    r.setMimeType(mime);
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    try { r.setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, "fenix_" + System.currentTimeMillis()); }
                    catch (Exception e) { r.setDestinationInExternalFilesDir(MainActivity.this, Environment.DIRECTORY_DOWNLOADS, "fenix_" + System.currentTimeMillis()); }
                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    dm.enqueue(r);
                    Toast.makeText(getApplicationContext(), "Baixando — veja nas notificações", Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(u))); } catch (Exception e2) {}
                }
            }
        });
        wv.addJavascriptInterface(new Ponte(), "FenixApp");
        setContentView(wv);
        wv.loadUrl("file:///android_asset/www/index.html");
        pedirPerms();
    }

    private boolean temPerm(String p) {
        try { return checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED; } catch (Exception e) { return false; }
    }

    private class Ponte {
        @JavascriptInterface public void pedirPerms() {
            runOnUiThread(new Runnable() { public void run() { pedirPerms(); } });
        }
        @JavascriptInterface public String statusPerms() {
            try {
                NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                boolean noti = nm != null && nm.areNotificationsEnabled();
                boolean arq;
                if (Build.VERSION.SDK_INT >= 33) arq = temPerm("android.permission.READ_MEDIA_IMAGES");
                else arq = temPerm("android.permission.READ_EXTERNAL_STORAGE");
                return "{\"noti\":" + noti + ",\"arq\":" + arq + "}";
            } catch (Exception e) { return "{\"noti\":false,\"arq\":false}"; }
        }
        @JavascriptInterface public void abrirConfig() {
            try {
                Intent i = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                i.setData(Uri.fromParts("package", getPackageName(), null));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception e) { try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Exception e2) {} }
        }
        @JavascriptInterface public void baixar(final String url, final String nome) {
            runOnUiThread(new Runnable() { public void run() {
                try {
                    DownloadManager.Request r = new DownloadManager.Request(Uri.parse(url));
                    r.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
                    if (nome != null && nome.trim().length() > 0) r.setDestinationInExternalFilesDir(MainActivity.this, Environment.DIRECTORY_DOWNLOADS, nome.trim());
                    DownloadManager dm = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
                    dm.enqueue(r);
                    Toast.makeText(getApplicationContext(), "Baixando", Toast.LENGTH_SHORT).show();
                } catch (Exception e) { try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e2) {} }
            }});
        }
    }

    void pedirPerms() {
        try {
            if (Build.VERSION.SDK_INT >= 33) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS", "android.permission.READ_MEDIA_IMAGES", "android.permission.READ_MEDIA_VIDEO"}, RC_PERM);
            } else if (Build.VERSION.SDK_INT >= 23) {
                requestPermissions(new String[]{"android.permission.READ_EXTERNAL_STORAGE", "android.permission.WRITE_EXTERNAL_STORAGE"}, RC_PERM);
            }
        } catch (Exception e) {}
    }

    @Override protected void onActivityResult(int rq, int rc, Intent data) {
        if (rq == RC_FILE) {
            if (fileCb != null) {
                Uri[] out = null;
                if (rc == RESULT_OK && data != null && data.getData() != null) out = new Uri[]{data.getData()};
                fileCb.onReceiveValue(out);
                fileCb = null;
            }
            return;
        }
        super.onActivityResult(rq, rc, data);
    }

    @Override public void onBackPressed() {
        if (wv != null && wv.canGoBack()) wv.goBack(); else super.onBackPressed();
    }
}
