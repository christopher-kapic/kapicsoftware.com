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
  return Response.redirect(`${url}contact`, 307)
}