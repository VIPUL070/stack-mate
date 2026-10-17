"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  NavbarLogo,
  NavbarButton,
} from "@/components/ui/resizable-navbar";
import FloatingMenu from "./menu";
import DiscoverButton from "../block/discover-button";

function SiteNavbar() {
  const { userId } = useAuth();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", link: userId ? "/dashboard" : "/signin" },
    { name: "FAQ", link: "/#faq" },
    { name: "Platform", link: "/#platform" },
  ];

  const menuItems = [
    ...navItems.map((item) => ({
      label: item.name,
      onClick: () => router.push(item.link),
    })),
    { label: "Get Started", onClick: () => router.push("/signup") },
    { label: "Sign In", onClick: () => router.push("/signin") },
  ];

  return (
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="relative z-20 flex items-center">
            <NavbarButton href="/signin" variant="secondary">
              Sign In
            </NavbarButton>
            <DiscoverButton label="Get Started" href="/signup"/>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <FloatingMenu items={menuItems} inline />
          </MobileNavHeader>
        </MobileNav>
      </Navbar>
  );
}

export default SiteNavbar;