import { getApiUrl } from "./config.util.js";

async function sendOtp(email){

const response = await fetch(`${getApiUrl()}/auth/send-otp`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({email})
});

const data = await response.json();
return data
}

async function logIn(email, otp){

const response = await fetch(`${getApiUrl()}/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({email, otp})
});

const data = await response.json();
return data
}

export {sendOtp, logIn}