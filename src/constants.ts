import type { Props } from "astro";
import IconMail from "@/assets/icons/IconMail.svg";
import IconGitHub from "@/assets/icons/IconGitHub.svg";
import IconBrandBluesky from "@/assets/icons/IconBrandBluesky.svg";
import IconBrandX from "@/assets/icons/IconBrandX.svg";
import IconLinkedin from "@/assets/icons/IconLinkedin.svg";
import IconFacebook from "@/assets/icons/IconFacebook.svg";
import { SITE } from "@/config";

interface Social {
  name: string;
  href: string;
  linkTitle: string;
  icon: (_props: Props) => Element;
}

export const SOCIALS: Social[] = [
  {
    name: "GitHub",
    href: "https://github.com/maartenba",
    linkTitle: `${SITE.title} on GitHub`,
    icon: IconGitHub,
  },
  {
    name: "Bluesky",
    href: "https://bsky.app/profile/maartenballiauw.be/",
    linkTitle: `${SITE.title} on Bluesky`,
    icon: IconBrandBluesky,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/maartenballiauw/",
    linkTitle: `${SITE.title} on LinkedIn`,
    icon: IconLinkedin,
  },
  {
    name: "X",
    href: "https://x.com/maartenballiauw",
    linkTitle: `${SITE.title} on X`,
    icon: IconBrandX,
  },
] as const;

export const SHARE_LINKS: Social[] = [
  {
    name: "Bluesky",
    href: "https://bsky.app/intent/compose&text=",
    linkTitle: `Share this post on Bluesky`,
    icon: IconBrandBluesky,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/sharer.php?u=",
    linkTitle: `Share this post on Facebook`,
    icon: IconFacebook,
  },
  {
    name: "X",
    href: "https://x.com/intent/post?url=",
    linkTitle: `Share this post on X`,
    icon: IconBrandX,
  },
  {
    name: "Mail",
    href: "mailto:?subject=See%20this%20post&body=",
    linkTitle: `Share this post via email`,
    icon: IconMail,
  },
] as const;
