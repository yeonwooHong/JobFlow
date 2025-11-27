import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './auth/authProvider'


export default async function Home() {
  const supabase = await createClient()
  // const session = await supabase.auth.getUser()
  // console.log(session)
  // Reads the session from cookies
  const { data: { user } } = await supabase.auth.getUser()
  
  console.log(user)

  if (!user) {
    // Redirect to login if not authenticated
    redirect('/auth')
  }
  
  return (
    <div className="">
      Hello {user.user_metadata.name}
      <form>
        <button type='submit' className='btn' formAction={signOut}>
          Sign Out
        </button>
      </form>
    </div>
  );
}