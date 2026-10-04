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
                    /* R88 — aceita ESCOLHER VÁRIOS quando o campo pede (ex.: Arquivos) */
                    try { if (p.getMode() == android.webkit.WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE) i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true); } catch (Exception e2) {}
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
        /* R67 — AUTO-UPDATE: se já baixou versão nova da nuvem, carrega ela; senão a cópia interna */
        java.io.File live = new java.io.File(getFilesDir(), "app-live.html");
        wv.loadUrl(live.exists() ? ("file://" + getFilesDir() + "/app-live.html") : "file:///android_asset/www/index.html");
        pedirPerms();
        new Thread(new Runnable() { public void run() { checaNova(); } }).start();
    }

    /* R67 — AUTO-UPDATE (padrão Center): compara a versão da nuvem com a instalada; se a nuvem for mais nova, baixa o app e recarrega na hora */
    private static final String NUVEM = "https://geniterapeuta12-tech.github.io/fenix-estetica/";

    private void checaNova() {
        try {
            String local = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            String vjson = puxa(NUVEM + "versao.json", 5000);
            String rem = extrai(vjson, "\"versao\"\\s*:\\s*\"([0-9.]+)\"");
            if (rem == null || !maisNova(rem, local)) return;
            String html = puxa(NUVEM + "index.html", 8000);
            if (html == null || html.indexOf("APP_VERSAO") < 0) return;
            java.io.FileOutputStream f = openFileOutput("app-live.html", MODE_PRIVATE);
            f.write(html.getBytes("UTF-8"));
            f.close();
            runOnUiThread(new Runnable() { public void run() {
                try { wv.loadUrl("file://" + getFilesDir() + "/app-live.html"); } catch (Exception e) {}
            }});
        } catch (Exception e) {}
    }

    private String puxa(String u, int tmo) {
        try {
            java.net.HttpURLConnection c = (java.net.HttpURLConnection) new java.net.URL(u).openConnection();
            c.setConnectTimeout(tmo);
            c.setReadTimeout(tmo + 5000);
            c.setInstanceFollowRedirects(true);
            c.setRequestProperty("Cache-Control", "no-cache");
            java.io.InputStream in = c.getInputStream();
            java.io.ByteArrayOutputStream b = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[8192];
            int n;
            while ((n = in.read(buf)) > 0) b.write(buf, 0, n);
            in.close();
            return b.toString("UTF-8");
        } catch (Exception e) { return null; }
    }

    private String extrai(String s, String rx) {
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile(rx).matcher(s);
            return m.find() ? m.group(1) : null;
        } catch (Exception e) { return null; }
    }

    private boolean maisNova(String a, String b) {
        try {
            String[] x = a.split("\\.");
            String[] y = b.split("\\.");
            int n = Math.max(x.length, y.length);
            for (int i = 0; i < n; i++) {
                int xi = i < x.length ? Integer.parseInt(x[i]) : 0;
                int yi = i < y.length ? Integer.parseInt(y[i]) : 0;
                if (xi != yi) return xi > yi;
            }
            return false;
        } catch (Exception e) { return false; }
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
                if (rc == RESULT_OK && data != null) {
                    /* R88 — vários arquivos (ClipData) ou um só */
                    android.content.ClipData clip = data.getClipData();
                    if (clip != null) {
                        java.util.ArrayList<Uri> ls = new java.util.ArrayList<>();
                        for (int i2 = 0; i2 < clip.getItemCount(); i2++) { Uri u2 = clip.getItemAt(i2).getUri(); if (u2 != null) ls.add(u2); }
                        if (!ls.isEmpty()) out = ls.toArray(new Uri[0]);
                    } else if (data.getData() != null) out = new Uri[]{data.getData()};
                }
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
