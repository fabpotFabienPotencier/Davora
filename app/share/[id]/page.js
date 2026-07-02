import SharedChatClient from "./SharedChatClient";

export async function generateStaticParams() {
  return [];
}

export default function SharedChatPage() {
  return <SharedChatClient />;
}
