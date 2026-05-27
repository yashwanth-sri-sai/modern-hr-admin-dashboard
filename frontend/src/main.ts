import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).then(() => {
  console.info('[NSQTech] Application bootstrapped');
}).catch((err) => {
  console.error(err);
  document.body.innerHTML = `
    <div style="font-family:system-ui;padding:32px;max-width:640px;margin:0 auto;">
      <h1 style="color:#ef4444;margin:0 0 12px;">Application failed to start</h1>
      <pre style="background:#1e293b;color:#f8fafc;padding:16px;border-radius:8px;overflow:auto;font-size:13px;">${String(err)}</pre>
    </div>`;
});


