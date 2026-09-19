import { SignIn } from "@clerk/nextjs"

const Page = () => {
  return (
    <div className="flex items-center justify-center h-dvh">
      <SignIn />
    </div>
  )
}

export default Page