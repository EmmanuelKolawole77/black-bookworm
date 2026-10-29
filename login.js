import * as store from "./store.js";
import { SEED_BOOKS } from "./books-seed.js";
import { ADMIN_ID, DEMO_ADMIN_PASSWORD } from "./firebase-config.js";

const $ = (sel) => document.querySelector(sel);
let signupMode = false;
let redirecting = false;

/* ------------------------------ messages ------------------------------ */

function show(kind, text) {
  $("#loginError").classList.add("d-none");
  $("#loginInfo").classList.add("d-none");
  if (!text) return;
  const el = kind === "error" ? $("#loginError") : $("#loginInfo");
  el.textContent = text;
  el.classList.remove("d-none");
}

/* ------------------------------ sign in / sign up modes ------------------------------ */

function setMode(signup) {
  signupMode = signup;
  $("#loginTitle").textContent = signup ? "Create your account" : "Welcome back";
  $("#loginSub").textContent = signup ? "It takes a minute. Then you can shop." : "Sign in to start shopping.";
  $("#loginSubmit").textContent = signup ? "Create account" : "Sign in";
  $("#nameField").classList.toggle("d-none", !signup);
  $("#idLabel").textContent = signup ? "Email address" : "Email address or admin ID";
  $("#loginId").type = signup ? "email" : "text";
  $("#loginPassword").autocomplete = signup ? "new-password" : "current-password";
  $("#forgotRow").classList.toggle("d-none", signup);
  $("#switchRow").innerHTML = signup
    ? `Already have an account? <button type="button" class="link-button" id="switchBtn">Sign in</button>`
    : `New here? <button type="button" class="link-button" id="switchBtn">Create an account</button>`;
  $("#switchBtn").addEventListener("click", () => { show(); setMode(!signupMode); });
}

/* ------------------------------ routing by role ------------------------------ */

// Admin goes straight to the dashboard. Everyone else goes straight to the shop.
async function routeUser(user) {
  if (redirecting) return;
  redirecting = true;
  const role = await store.getRole(user);
  location.replace(role === "admin" ? "admin.html" : "shop.html");
}

/* ------------------------------ events ------------------------------ */

function bind() {
  $("#pwToggle").addEventListener("click", () => {
    const input = $("#loginPassword");
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    $("#pwToggle").innerHTML = `<i class="bi bi-eye${showing ? "" : "-slash"}" aria-hidden="true"></i>`;
    $("#pwToggle").setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    show();
    const id = $("#loginId").value.trim();
    const password = $("#loginPassword").value;
    const name = $("#loginName").value.trim();
    if (!id || !password) return show("error", "Enter your details to continue.");
    if (signupMode && !name) return show("error", "Enter your name.");

    const btn = $("#loginSubmit");
    btn.disabled = true;
    try {
      // For sign-up, hold the redirect until the new profile has been saved.
      if (signupMode) {
        redirecting = true;
        const user = await store.signUp(name, id, password);
        redirecting = false;
        routeUser(user);
      } else {
        await store.logIn(id, password); // onAuth (below) routes the user
      }
    } catch (err) {
      redirecting = false;
      show("error", err.message);
      btn.disabled = false;
    }
  });

  $("#googleBtn").addEventListener("click", async () => {
    show();
    redirecting = true; // wait until the profile is saved
    try {
      const user = await store.logInGoogle();
      redirecting = false;
      routeUser(user);
    } catch (err) { redirecting = false; show("error", err.message); }
  });

  $("#forgotBtn").addEventListener("click", async () => {
    const email = $("#loginId").value.trim();
    if (!email.includes("@")) return show("error", "Type your email above first, then press this again.");
    try { await store.resetPassword(email); show("info", "Reset link sent. Check your inbox."); }
    catch (err) { show("error", err.message); }
  });
}

/* ------------------------------ brand panel covers ------------------------------ */

function fillCovers() {
  const pick = SEED_BOOKS.filter((b) => b.featured).slice(0, 4);
  $("#loginCovers").innerHTML = pick
    .map((b) => `<img src="${b.cover}" alt="" loading="lazy">`)
    .join("");
  document.querySelectorAll("#loginCovers img").forEach((img) => {
    const hide = () => img.remove();
    img.onerror = hide;
    img.addEventListener("load", () => { if (img.naturalWidth <= 1) hide(); });
  });
}

/* ------------------------------ start ------------------------------ */

async function start() {
  setMode(false);
  bind();
  fillCovers();

  if (store.mode === "demo") {
    const note = $("#demoNote");
    note.innerHTML = `<strong>Demo mode.</strong> Create an account to shop as a customer, or sign in as admin with ID <code>${ADMIN_ID}</code> and password <code>${DEMO_ADMIN_PASSWORD}</code>. Remove this note once Firebase is connected.`;
    note.classList.remove("d-none");
  }

  try { await store.init(); }
  catch (e) { console.error(e); show("error", "Could not reach Firebase. Check firebase-config.js."); return; }

  // Already signed in? Skip the form and go to the right place.
  store.onAuth((user) => { if (user) routeUser(user); });
}

start();
