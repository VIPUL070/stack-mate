import { ArrowUpRight } from "lucide-react"
import SignaturePad from "../arc/signature-pad/signature-pad"
import { Container } from "../ui/container"
import Link from "next/link"

const Footer = () => {
  return (
    <footer
        id="footer"
        className="bg-ink py-16 text-paper sm:py-20 bg-[url('/footer.jpg')] bg-cover bg-center bg-no-repeat min-h-screen"
      >
        <Container>
          <div className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-2 text-sm font-semibold">
                <span className="grid size-7 place-items-center rounded-full bg-paper text-ink">
                  S
                </span>
                StackMate<span className="text-white/40">.ai</span>
              </div>
              <h2 className="display-type max-w-xl text-5xl leading-[0.9] sm:text-7xl">
                Make the next answer count.
              </h2>
            </div>
            <Link
              href="#top"
              className="inline-flex items-center gap-2 self-start rounded-full bg-paper px-5 py-3 text-sm font-medium text-ink transition-transform hover:scale-[1.03] md:self-end"
            >
              Get started <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
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