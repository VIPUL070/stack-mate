import { ArrowUpRight } from "lucide-react"
import SignaturePad from "../arc/signature-pad/signature-pad"
import { Container } from "../ui/container"
import Link from "next/link"
import DiscoverButton from "../block/discover-button"
import { NavbarLogo } from "../ui/resizable-navbar"

const Footer = () => {
  return (
    <footer
        id="footer"
        className="bg-ink py-16 text-paper sm:py-20 bg-[url('/footer.jpg')] bg-cover bg-center bg-no-repeat min-h-screen"
      >
        <Container>
          <div className="flex flex-col justify-between gap-15 md:flex-row md:items-end">

          <div className="flex flex-col gap-8">
              <NavbarLogo />
              <h2 className="display-type max-w-xl text-5xl leading-[0.9] sm:text-7xl">
                Make the next answer count.
              </h2>
            <DiscoverButton label="Get Started" href="/signup"/>
            </div>

           <SignaturePad />
          </div>

          <div className="mt-16 flex flex-col justify-between gap-4 border-t border-foreground pt-5 text-xs text-foreground sm:flex-row">
            <span>© 2026 StackMate</span>
            <span>Content intelligence, made human.</span>
          </div>

        </Container>
      </footer>
  )
}

export default Footer