export const runtime = "edge"

import { auth } from "../server/auth";

export default async function Home() {
  const session = await auth()
  return (
   <>hello
   <div>{session?.user?.id}</div>
   </>
  );
}
