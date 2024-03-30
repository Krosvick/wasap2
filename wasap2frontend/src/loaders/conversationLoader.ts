import { getConversationMessages } from "../services/contactsService";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { UserJWT } from "../services/userService";


export async function conversationLoader({
  params,
}: {
  params: { conversationId: string };
}) {
  const conversationId = params.conversationId;
  if (!Cookies.get("token")) {
    return { conversation: null };
  }
  const decodedToken = jwtDecode(Cookies.get("token")!);
  const payload = decodedToken as UserJWT;
  const userId = payload.id;
  const conversation = await getConversationMessages(userId, conversationId);
  return { conversation, userId };
}