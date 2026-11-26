export function canOpenOffline({ mode, consent, owner, expires, authenticatedFailure, now = Date.now() }) {
  return mode === 'local' || (mode === 'google' && consent === true && !!owner && Number.isFinite(expires) && expires > now && !authenticatedFailure);
}
export function signInScreen() {
  return `<div class="card hero"><p class="eyebrow">Your learning, wherever you return</p><h1>Welcome to LearnLoop.</h1><p>Sign in to use the same personal library and progress on your phone and PC.</p><label class="check"><input id="offline-consent" type="checkbox"><span>Keep an offline copy on this personal device.<br><span class="small muted">Leave this off on a shared computer. An offline copy can be opened here without another sign-in until your session expires.</span></span></label><button class="btn primary" data-do="google-login">Continue with Google →</button><p class="small muted section">Access is invitation-only. Signing out clears this site's saved device data. Google provides your basic sign-in identity; LearnLoop does not request Drive or Gmail access.</p></div>`;
}
export function signOutScreen(pending) {
  return `<div class="card"><h1>Sign out of this device?</h1><p>Your accepted library and progress stay on the server. This clears the saved library, drafts and offline permission on this browser.</p>${pending.length?'<p class="callout">Sync pending work before signing out. Save device recovery from Data if you need to keep a separate copy.</p>':''}<div class="actions"><button class="btn primary" data-do="confirm-signout" ${pending.length?'disabled':''}>Sign out &amp; clear device</button><button class="btn" data-nav="data">Keep learning</button></div></div>`;
}
