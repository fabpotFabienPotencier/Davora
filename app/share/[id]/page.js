import SharedChatClient from "./SharedChatClient";

export async function generateStaticParams() {
  return [{ id: "default" }];
}

export default function SharedChatPage() {
  return <SharedChatClient />;
}
