import FooterSection from "@/components/footer";
import IntegrationsSection from "@/components/integrations-4";
import HeroSection from "@/components/hero-section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Headset,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const metrics = [
  { value: "350+", label: "Workflows orchestrated weekly" },
  { value: "65%", label: "Avg. execution time saved" },
  { value: "99.95%", label: "Uptime across regions" },
];

const features = [
  {
    icon: Sparkles,
    title: "Agentic by design",
    description:
      "Launch reliable AI agents with guardrails, fallbacks, and human-in-the-loop controls.",
    points: [
      "Declarative safety rules",
      "Retry & rollback aware",
      "Cost and latency budgets",
    ],
  },
  {
    icon: Workflow,
    title: "Visual + code editor",
    description:
      "Design flows collaboratively, then drop to code for edge-cases. Everything stays in sync.",
    points: ["Versioned drafts", "Reusable subflows", "One-click previews"],
  },
  {
    icon: ShieldCheck,
    title: "Enterprise ready",
    description:
      "SOC2-aligned controls, SSO, audit trails, and fine-grained permissioning out of the box.",
    points: ["Secret vaulting", "RBAC & approvals", "Signed webhooks"],
  },
];

const playbooks = [
  {
    id: "product",
    label: "Product",
    title: "Ship features faster with confident handoffs.",
    bullets: [
      "Prototype multi-step flows with live data in minutes.",
      "Spin up review environments that mirror production.",
      "Measure adoption with built-in analytics events.",
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    title: "Scale orchestrations without ops overhead.",
    bullets: [
      "Polyglot SDKs, typed payloads, and contract tests.",
      "Deterministic replays and event sourcing baked in.",
      "Runtime budget enforcement to keep costs predictable.",
    ],
  },
  {
    id: "operations",
    label: "Operations",
    title: "Codify playbooks and keep teams unblocked.",
    bullets: [
      "Route tasks to the right agent or human instantly.",
      "Escalate with context-rich timelines and notes.",
      "Compliance-friendly exports for every run.",
    ],
  },
];

const faqs = [
  {
    question: "How do I deploy to my stack?",
    answer:
      "Connect your repo, choose a region, and promote flows via protected environments. We provide CI snippets and one-click previews.",
  },
  {
    question: "Can I bring my own LLMs and tools?",
    answer:
      "Yes. Use any OpenAI-compatible model, Anthropic, or custom endpoints. Add functions and data sources as first-class nodes.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "You can prototype with generous sandbox limits. Paid plans unlock higher throughput, SSO, audit logs, and premium support.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <HeroSection />

      <section id="overview" className="bg-muted/40 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge variant="outline" className="w-fit">
                Built for AI-native teams
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Ship agentic workflows with confidence.
              </h2>
              <p className="text-muted-foreground text-lg">
                Orchestrate multi-step AI experiences, enforce guardrails, and
                keep humans in the loop—all in one workspace that meets your
                compliance bar.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 shadow-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  SOC2-aligned controls
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-background px-3 py-2 shadow-sm">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Deterministic replays
                </span>
              </div>
            </div>
            <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-none">
              {metrics.map((metric) => (
                <Card key={metric.label} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-3xl font-semibold">
                      {metric.value}
                    </CardTitle>
                    <CardDescription>{metric.label}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary" className="w-fit">
                Platform pillars
              </Badge>
              <h3 className="text-3xl font-semibold md:text-4xl">
                Why teams switch to us
              </h3>
              <p className="text-muted-foreground max-w-2xl">
                From prototyping to production, keep every workflow observable,
                secure, and ready to scale across regions and models.
              </p>
            </div>
            <Button asChild variant="outline" className="group">
              <a href="#features" className="inline-flex items-center gap-2">
                Explore docs
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="h-full">
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {feature.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{point}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="playbooks" className="bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-3">
            <Badge variant="secondary" className="w-fit">
              Live playbooks
            </Badge>
            <h3 className="text-3xl font-semibold md:text-4xl">
              Choose your starting lane
            </h3>
            <p className="text-muted-foreground max-w-3xl">
              Opinionated templates to move faster—swap in your stack, models,
              and data sources. Preview everything before you ship.
            </p>
          </div>

          <Tabs defaultValue="product" className="mt-8">
            <TabsList className="w-full justify-start overflow-x-auto">
              {playbooks.map((playbook) => (
                <TabsTrigger
                  key={playbook.id}
                  value={playbook.id}
                  className="text-sm"
                >
                  {playbook.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {playbooks.map((playbook) => (
              <TabsContent
                key={playbook.id}
                value={playbook.id}
                className="mt-6 flex flex-col gap-6 lg:flex-row"
              >
                <Card className="flex-1">
                  <CardHeader className="space-y-3">
                    <Badge variant="outline" className="w-fit">
                      Recommended
                    </Badge>
                    <CardTitle>{playbook.title}</CardTitle>
                    <CardDescription>
                      Pre-wired steps, prompts, and controls ready for your
                      stack.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {playbook.bullets.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 text-sm"
                      >
                        <CheckCircle2 className="mt-1 h-4 w-4 text-primary" />
                        <span>{item}</span>
                      </div>
                    ))}
                    <Button className="mt-2 w-fit">Use this template</Button>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Live preview
                    </CardTitle>
                    <CardDescription>
                      See runs, fallbacks, and costs in real time.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-xl border bg-background/80 p-4">
                      <Image
                        src="/demo.png"
                        alt="Workflow preview"
                        width={1200}
                        height={720}
                        className="rounded-lg border shadow-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <IntegrationsSection />

      <section
        id="how-it-works"
        className="bg-muted/40 py-16 md:py-24"
        aria-labelledby="how-it-works-heading"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                How it works
              </Badge>
              <h3
                id="how-it-works-heading"
                className="text-3xl font-semibold md:text-4xl"
              >
                From idea to production
              </h3>
              <div className="space-y-4">
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle>Design collaboratively</CardTitle>
                    <CardDescription>
                      Start with visual flows, sync to code, and share preview
                      links with stakeholders.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle>Ship with guardrails</CardTitle>
                    <CardDescription>
                      Set validation, human approvals, and rollback plans before
                      promoting to production.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="space-y-1">
                    <CardTitle>Observe and improve</CardTitle>
                    <CardDescription>
                      Trace every run, compare prompts, and capture feedback to
                      continuously fine-tune.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg">Start free</Button>
                <Button size="lg" variant="outline">
                  Talk to an engineer
                </Button>
              </div>
            </div>

            <div className="space-y-4" id="faq">
              <Badge variant="outline" className="w-fit">
                FAQ
              </Badge>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={faq.question} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="py-16 md:py-24"
        aria-labelledby="contact-heading"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                Ready to launch
              </Badge>
              <h3
                id="contact-heading"
                className="text-3xl font-semibold md:text-4xl"
              >
                Talk with an engineer or start for free
              </h3>
              <p className="text-muted-foreground max-w-2xl">
                Get hands-on support for your first workflow, or open the
                sandbox and ship at your own pace. We respond within one
                business day.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/sign-up">Start free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:hello@a2a.dev">Book time</a>
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  SOC2-aligned controls
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2">
                  <Clock3 className="h-4 w-4 text-primary" />
                  Typical response &lt; 24h
                </span>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <CardTitle>Chat with an engineer</CardTitle>
                  <CardDescription>
                    Pair on your first flow design, integrations, and deployment
                    plan.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <CardTitle>Security review ready</CardTitle>
                  <CardDescription>
                    Data handling overview, signed webhooks, RBAC, and audit
                    trails included.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Headset className="h-5 w-5" />
                  </div>
                  <CardTitle>Premium support</CardTitle>
                  <CardDescription>
                    Slack Connect with the team that builds the platform.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="space-y-2">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <CardTitle>Keep the thread going</CardTitle>
                  <CardDescription>
                    Email summaries after every working session so your team can
                    execute.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
