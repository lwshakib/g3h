import Image from "next/image"

import {
  ArrowRight,
  Blend,
  ChartNoAxesColumn,
  CircleDot,
  Diamond,
} from "lucide-react"

import { DashedLine } from "@/components/dashed-line"
import { Button } from "@workspace/ui/components/button"

const features = [
  {
    title: "Tailored workflows",
    description: "Track progress across custom issue flows for your team.",
    icon: CircleDot,
  },
  {
    title: "Cross-team projects",
    description: "Collaborate across teams and departments.",
    icon: Blend,
  },
  {
    title: "Milestones",
    description: "Break projects down into concrete phases.",
    icon: Diamond,
  },
  {
    title: "Progress insights",
    description: "Track scope, velocity, and progress over time.",
    icon: ChartNoAxesColumn,
  },
]

export const Hero = () => {
  return (
    <section className="py-28 lg:py-32 lg:pt-44">
      <div className="container flex flex-col justify-between gap-8 md:gap-14 lg:flex-row lg:gap-20">
        {/* Left side - Main content */}
        <div className="flex-1">
          <h1 className="max-w-160 text-3xl tracking-tight text-foreground md:text-4xl lg:text-5xl xl:whitespace-nowrap">
            Mainline Next.js template
          </h1>

          <p className="text-1xl mt-5 text-muted-foreground md:text-3xl">
            Mainline is an open-source website template built with shadcn/ui,
            Tailwind 4 & Next.js
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 lg:flex-nowrap">
            <Button asChild>
              <a href="https://github.com/shadcnblocks/mainline-nextjs-template">
                Get template
              </a>
            </Button>
            <Button
              variant="outline"
              className="h-auto gap-2 bg-linear-to-r from-background to-transparent shadow-md"
              asChild
            >
              <a
                href="https://shadcnblocks.com"
                className="max-w-56 truncate text-start md:max-w-none"
              >
                Built by shadcnblocks.com
                <ArrowRight className="stroke-3" />
              </a>
            </Button>
          </div>
        </div>

        {/* Right side - Features */}
        <div className="relative flex flex-1 flex-col justify-center space-y-5 max-lg:pt-10 lg:pl-10">
          <DashedLine
            orientation="vertical"
            className="absolute top-0 left-0 max-lg:hidden"
          />
          <DashedLine
            orientation="horizontal"
            className="absolute top-0 lg:hidden"
          />
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="flex gap-2.5 lg:gap-5">
                <Icon className="mt-1 size-4 shrink-0 text-foreground lg:size-5" />
                <div>
                  <h2 className="font-text font-semibold text-foreground">
                    {feature.title}
                  </h2>
                  <p className="max-w-76 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-12 max-lg:ml-6 max-lg:h-[550px] max-lg:overflow-hidden md:mt-20 lg:container lg:mt-24">
        <div className="relative h-[793px] w-full">
          <Image
            src="/hero.webp"
            alt="hero"
            fill
            className="rounded-2xl object-cover object-left-top shadow-lg max-lg:rounded-tr-none"
          />
        </div>
      </div>
    </section>
  )
}
