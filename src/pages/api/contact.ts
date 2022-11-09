import queryStringToJSON from "@utils/QueryStringtoJSON"; // This should be built in to JavaScript, but it is not.
import { url } from "@utils/GetURL";

export async function post({request}: {request: Request}) {
  const body = queryStringToJSON(await request.text())
  console.log(body)
  // Example body:
  // {
  //   email: "christopher@example.com",
  //   message: "Hi, I'd like to buy your product!"
  // }
  await fetch(import.meta.env.SLACK_NOTIFICATION_URL, {
    method: "POST",
    body: JSON.stringify({
      text: `${body.email} just requested a consultation for a website.\n${body.message}`
    })
  })
  return Response.redirect(`${url}success`, 307)
}