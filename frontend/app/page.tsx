import { createClient } from './utils/supabase/server'  // Fixed: use createClient
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  // const session = await supabase.auth.getUser()
  // console.log(session)
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log(user)

  if (!user) {
    redirect('/auth')
  }
  
  return (
    <div className="">
      Hello {user.email}
    </div>
  );
}