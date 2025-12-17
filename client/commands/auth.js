import { select, input } from "@inquirer/prompts";
import { sendOtp, logIn } from "../utils/api.util.js"
import { setAuth } from "../utils/config.util.js";


async function auth() {
  const hasAccount = await select({
    message: "Do you already have an account?",
    choices: [
      { name: "Yes", value: true },
      { name: "No", value: false }
    ]
  });
  
  if (hasAccount) {
    const email = await input({ message: 'What is your email?' });
    const result = await sendOtp(email)
    const otp = await input({message: 'Enter the OTP just sent to your email'})
    const login = await logIn(email, otp) 
    if (login.token){
      setAuth(login.token)
      console.log("Logged in successfully")
    } else {
      console.log(login.error)
    }
  } else {

  }
}

export {auth}
