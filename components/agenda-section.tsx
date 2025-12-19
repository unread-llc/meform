"use client"

import { useState } from "react"
import { Calendar, Clock, Users, ChevronDown, Mic2, Lightbulb, Target, CheckCircle2, FileText, LayoutGrid, Download, Maximize2, X } from "lucide-react"

interface AgendaSectionProps {
  dict: any
  locale?: string
}

type SessionType = "plenary" | "sub"

interface Session {
  id: string
  type: SessionType
  title: string
  titleMn?: string
  time?: string
  day: 1 | 2
  importance: string
  purpose: string
  outcome: string
}

const sessions: Session[] = [
  // Day 1
  {
    id: "plenary-1",
    type: "plenary",
    title: "Sustainability of Mongolia's Development Policy",
    titleMn: "Монгол Улсын хөгжлийн бодлогын тогтвортой байдал",
    day: 1,
    importance: "Section 7, Article 1 of the Constitution of Mongolia stipulates the principle of 'stable development policy and planning.' Within Mongolia's long-term development policy 'Vision 2050', the nation has set ambitious goals to achieve balanced development across nature, people, society, and the economy by 2050.",
    purpose: "This session focuses on raising awareness about the importance of incorporating sustainable practices into development policy planning. By highlighting the connection between sustainable development and policy planning, we encourage participants to explore innovative solutions and collaborative efforts.",
    outcome: "Participants will gain a deeper understanding of sustainable development, exchange ideas and best practices, gain policy insights, and connect with like-minded individuals for future collaborations."
  },
  {
    id: "sub-1",
    type: "sub",
    title: "Labour Market",
    titleMn: "Хөдөлмөрийн зах зээл",
    day: 1,
    importance: "To enhance employment rates and improve citizens' income, focusing on increasing employment opportunities and creating high-quality decent jobs is imperative. A comprehensive analysis and long-term forecast of labor market trends are crucial.",
    purpose: "Conduct a comprehensive assessment of the current status and future trajectories of the labor market, establishing a harmonious equilibrium between labor supply and demand while exploring effective strategies to align education and training initiatives.",
    outcome: "Facilitate sharing of successful practices, policies, and initiatives from other countries while fostering solid social partnerships and exploring strategies to maintain balanced equilibrium between labor market supply and demand."
  },
  {
    id: "sub-2",
    type: "sub",
    title: "Digital Transformation and Digital Economy",
    titleMn: "Дижитал шилжилт ба дижитал эдийн засаг",
    day: 1,
    importance: "The 'Information Technology and Creative Industry' sector has been identified as a priority in 'Vision-2050', and the Government has set the goal of becoming a 'Digital Nation.' As of 2022, the ICT sector accounts for 1.89% of Mongolia's GDP.",
    purpose: "Focus on bolstering digital infrastructure, establishing a designated IT zone, managing big data, fostering software production, advancing artificial intelligence, cultivating a skilled workforce, and nurturing the startup ecosystem.",
    outcome: "Explore opportunities and foster collaborative solutions to expand the markets of artificial intelligence, data management, software, and the content industry. Introduce innovative concepts such as Smart-City and Smart-Province."
  },
  {
    id: "sub-3",
    type: "sub",
    title: "Trade Opportunities – Special Economic Zones",
    titleMn: "Худалдааны боломж – Тусгай эдийн засгийн бүс",
    day: 1,
    importance: "As a landlocked nation, Mongolia holds a significant advantage with its strategic geographical position as a vital link between Asia and Europe. This presents a prime opportunity to leverage enhanced trade relationships with neighboring countries.",
    purpose: "Enhance the regulatory environment for trade facilitation and foster the exchange of opinions on international best practices regarding the development of products and services within free zones.",
    outcome: "Provide valuable suggestions and initiatives regarding the effective utilization of free zones and the regulation of the legal framework to enhance trade profitability."
  },
  {
    id: "plenary-2",
    type: "plenary",
    title: "Mongolia's Economy and Sustainable Development",
    titleMn: "Монголын эдийн засаг ба тогтвортой хөгжил",
    day: 1,
    importance: "Mongolia remains committed to promoting inclusive and sustainable development in this time of unprecedented economic and social challenges arising from the pandemic and geopolitical instability.",
    purpose: "Discuss and exchange opinions on the Government's policies for strengthening the sources of stable economic growth and ensuring sustainable development.",
    outcome: "Exchange of opinions, definition of solutions, and opportunities for active cooperation in Government's policies to strengthen stable economic growth and ensure sustainable development."
  },
  {
    id: "sub-4",
    type: "sub",
    title: "Investment in Agriculture",
    titleMn: "Хөдөө аж ахуйн хөрөнгө оруулалт",
    day: 1,
    importance: "This discussion highlights the untapped potential of organic, healthy, and natural food and agricultural raw materials, focusing on enabling them to compete globally and export finished goods.",
    purpose: "Develop a strategic roadmap to enhance agriculture, livestock, and food processing sectors, focusing on promoting the export of organic, healthy, and eco-friendly agricultural products globally.",
    outcome: "Strengthen financial investment in these sectors to boost capital inflow while establishing a balanced and sustainable approach to ensure natural resource preservation."
  },
  {
    id: "sub-5",
    type: "sub",
    title: "New Production – Food Manufacturing",
    titleMn: "Шинэ үйлдвэрлэл – Хүнсний үйлдвэрлэл",
    day: 1,
    importance: "The President of Mongolia initiated the National Movement 'Food Supply and Security' which has been implemented nationwide through Parliament Resolution No. 36 of 2022.",
    purpose: "Offer in-depth insights to domestic and foreign investors regarding Mongolia's food industry, including sector's state policies, available resources, and potential opportunities for investment.",
    outcome: "Present domestic and international investors with comprehensive overview of government's policies and initiatives in the food sector with investment opportunities and business prospects."
  },
  {
    id: "sub-6",
    type: "sub",
    title: "New Opportunities – Tourism",
    titleMn: "Шинэ боломж – Аялал жуулчлал",
    day: 1,
    importance: "Mongolia's 'Year of Living in Mongolia' for 2023-2025 aims to promote the country's attractions and investment opportunities in the tourism sector on a global scale.",
    purpose: "Explore ways to enhance the tourism sector, attract investment, and promote Mongolia as an appealing destination. Focus on cross-border tourism, visa requirements, and legal environment.",
    outcome: "Stakeholders' consensus on the legal framework and regulatory activities for the tourism industry, identification of international digital platform for promoting tourism abroad."
  },
  // Day 2
  {
    id: "plenary-3",
    type: "plenary",
    title: "New Future – New Opportunities",
    titleMn: "Шинэ ирээдүй – Шинэ боломж",
    day: 2,
    importance: "In the era of globalization, digital transformation, renewable energy, and space technology are rapidly developing. Focus is on increasing Mongolian citizens' competitiveness and expanding international cooperation.",
    purpose: "Present investors with the 'New Future - New Opportunities' framework, fostering mutual benefit and cooperation with Mongolia in areas like responsible mining, rare earth elements, banking, and renewable energy.",
    outcome: "Facilitate Mongolia's integration into the global arena through enhanced international cooperation, introducing high-level technologies and innovations for sustainable growth."
  },
  {
    id: "sub-7",
    type: "sub",
    title: "Future Development – Rare Earth Elements, Copper, Uranium",
    titleMn: "Ирээдүйн хөгжил – Ховор элемент, Зэс, Уран",
    day: 2,
    importance: "The discussion aims to establish Mongolia as a significant supplier in the global rare earth market and attract investments while clarifying stakeholder positions on significant mineral resource projects.",
    purpose: "Evaluate effectiveness of specific projects including Zuuvch-Ovoo, Dulaan-Uul deposit, Khairkhan and Gurvansaikhan uranium deposits, and examine impact of Oyutolgoi underground mine.",
    outcome: "Provide essential information for informed policy decisions on significant mining projects while presenting potential risks and challenges."
  },
  {
    id: "sub-8",
    type: "sub",
    title: "Investment Climate",
    titleMn: "Хөрөнгө оруулалтын орчин",
    day: 2,
    importance: "Mongolia's economic growth primarily hinges on foreign direct investment. Apart from mining, Mongolia possesses significant potential for growth in energy, tourism, and agriculture sectors.",
    purpose: "Facilitate exchange of viewpoints regarding measures aimed at establishing an open and favorable investment environment and discuss critical changes to the draft Revised Law on Investment.",
    outcome: "Create a favorable and conducive investment environment, attracting domestic and international investors and driving sustainable economic growth through legal reforms."
  },
  {
    id: "sub-9",
    type: "sub",
    title: "New Energy Sources – Solar, Wind and Hydrogen",
    titleMn: "Шинэ эрчим хүчний эх үүсвэр – Нар, Салхи, Устөрөгч",
    day: 2,
    importance: "Mongolia has strategically integrated new energy sources as a fundamental priority within its development policies, emphasizing green development and reduction of greenhouse gas emissions.",
    purpose: "Provide in-depth exploration of the potential for export development and green hydrogen production, leveraging abundant renewable energy resources available in Mongolia.",
    outcome: "Provide investors with comprehensive understanding of the potential for developing new energy sources in Mongolia and valuable insights regarding investment opportunities."
  },
  {
    id: "sub-10",
    type: "sub",
    title: "Banking and Finance",
    titleMn: "Банк, санхүү",
    day: 2,
    importance: "The Bank of Mongolia adopted 'The Medium-Term Banking Sector Reform Strategy' in 2020 to establish a resilient banking system with robust legal framework and modernized financial infrastructure.",
    purpose: "Provide support for decision-making by sharing real-time and objective information and reducing information asymmetries in an environment of heightened uncertainties.",
    outcome: "Discern prevailing challenges that hinder development of robust banking sector, foster investments by formulating recommendations for prospective policies and strategies."
  },
  {
    id: "sub-11",
    type: "sub",
    title: "Mineral Sector – Room for Improvement",
    titleMn: "Уул уурхайн салбар – Сайжруулах боломж",
    day: 2,
    importance: "The session provides comprehensive overview of the Draft Law on Minerals, elucidating its underlying concept and notable changes to cultivate an enhanced investment environment.",
    purpose: "Present the revised draft of the Law on Minerals to the public to foster a shared understanding and consensus with stakeholders and investors.",
    outcome: "Engage stakeholders on implementing the Law on Minerals, fostering responsible mining practices and collaboration between public and private sectors."
  },
  {
    id: "sub-12",
    type: "sub",
    title: "Opportunities for Regional Cooperation – Landlocked Countries",
    titleMn: "Бүс нутгийн хамтын ажиллагааны боломж",
    day: 2,
    importance: "Landlocked developing countries face various challenges including pandemics, escalating prices, food shortages, and energy crises. There is a growing need to transition to digital trade.",
    purpose: "Facilitate policy exchange among countries, experts, and researchers to identify successful strategies to overcome challenges and develop practical solutions.",
    outcome: "Formulate solutions to broaden regional cooperation, discern future trends, strengthen mutually advantageous trade relations, and eliminate trade barriers."
  },
  {
    id: "sub-13",
    type: "sub",
    title: "Urban Development",
    titleMn: "Хотын хөгжил",
    day: 2,
    importance: "Ulaanbaatar contributes approximately 63% to overall GDP. The 'Law on the Legal Status of Ulaanbaatar City' enables essential provisions for achieving financial and budgetary autonomy.",
    purpose: "Leverage opportunities presented by the new law to address challenges in Ulaanbaatar, attract fresh investments, and foster expanded collaboration between government and private sector.",
    outcome: "Identify requirements of private sector and international investors to be integrated into upcoming policies and plans through collaborative initiatives."
  },
  {
    id: "plenary-4",
    type: "plenary",
    title: "Mining Infrastructure and Logistics",
    titleMn: "Уул уурхайн дэд бүтэц ба логистик",
    day: 2,
    importance: "The session focuses on reforms implemented in Mongolia's transport and logistics sector and efforts to enhance access to ports and infrastructure to facilitate mining industry exports.",
    purpose: "Advance implementation of transport infrastructure development project to support mining exports and provide comprehensive information to international and domestic investors.",
    outcome: "Inform participants about projects and programs executed in road and transport sector, facilitate discussions on investment opportunities and strategies to attract investments."
  },
  {
    id: "sub-14",
    type: "sub",
    title: "Capital Markets",
    titleMn: "Хөрөнгийн зах зээл",
    day: 2,
    importance: "Collaborative efforts among financial regulatory bodies and infrastructure organizations have played a pivotal role in the notable expansion of Mongolia's capital market.",
    purpose: "Facilitate informed exchange of opinions leading to formulation of tangible steps for identifying opportunities and overcoming challenges in attracting international investments.",
    outcome: "Present Mongolia's capital market to international guests, showcase investment potential, identify challenges that impede international investments, and formulate effective solutions."
  },
  {
    id: "sub-15",
    type: "sub",
    title: "Green Development – Green Financing",
    titleMn: "Ногоон хөгжил – Ногоон санхүүжилт",
    day: 2,
    importance: "Sustainable development aims to mitigate global warming and advance environmentally conscious practices, including minimizing waste, promoting energy efficiency, and adopting green production methods.",
    purpose: "Facilitate discussions on augmenting climate change financing and fostering the growth of a green economy, sustainable consumption and production in Mongolia.",
    outcome: "Provide investors comprehensive information regarding opportunities within green economy and sustainable production, discuss 'Blue Horse' project and 'Billion Trees' movement."
  },
]

export function AgendaSection({ dict, locale = "en" }: AgendaSectionProps) {
  const [activeDay, setActiveDay] = useState<1 | 2>(1)
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"interactive" | "pdf">("interactive")
  const [isFullscreen, setIsFullscreen] = useState(false)

  const pdfUrl = locale === "mn"
    ? "/Meforum 2023 Agenda mon.pdf"
    : "/Meforum 2023 Agenda eng.pdf"

  const filteredSessions = sessions.filter(s => s.day === activeDay)
  const plenarySessions = filteredSessions.filter(s => s.type === "plenary")
  const subSessions = filteredSessions.filter(s => s.type === "sub")

  const toggleSession = (id: string) => {
    setExpandedSession(expandedSession === id ? null : id)
  }

  return (
    <div className="min-h-screen">
      {/* Fullscreen PDF Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-black/50">
            <h3 className="text-white font-medium">
              {dict.agenda?.pdfTitle || "MEF 2025 Agenda"} - {locale === "mn" ? "Монгол" : "English"}
            </h3>
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.agenda?.download || "Download"}</span>
              </a>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full rounded-lg"
              title="Agenda PDF"
            />
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative py-32 bg-gradient-to-br from-foreground via-foreground to-primary/90 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 border border-white/20">
            <Calendar className="w-4 h-4" />
            {dict.agenda?.label || "Forum Agenda"}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {dict.agenda?.title || "MEF 2025 Agenda"}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            {dict.agenda?.description || "Explore the comprehensive program featuring plenary sessions, sub-sessions, and networking opportunities across two days of impactful discussions."}
          </p>
        </div>
      </section>

      {/* Day Selector & View Toggle */}
      <section className="sticky top-16 z-40 bg-white border-b border-secondary shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("interactive")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === "interactive"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">{dict.agenda?.interactive || "Interactive"}</span>
              </button>
              <button
                onClick={() => setViewMode("pdf")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  viewMode === "pdf"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>

            {/* Day Selector - only show in interactive mode */}
            {viewMode === "interactive" && (
              <div className="flex gap-2">
                {[1, 2].map((day) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day as 1 | 2)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${
                      activeDay === day
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-secondary/50 text-foreground hover:bg-secondary"
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">{dict.agenda?.day || "Day"}</span> {day}
                  </button>
                ))}
              </div>
            )}

            {/* PDF Actions - only show in PDF mode */}
            {viewMode === "pdf" && (
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  download
                  className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground rounded-xl font-medium text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{dict.agenda?.download || "Download"}</span>
                </a>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-medium text-sm transition-colors hover:bg-primary/90"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{dict.agenda?.fullscreen || "Fullscreen"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PDF View */}
      {viewMode === "pdf" && (
        <section className="py-8 bg-gradient-to-b from-white to-secondary/30 min-h-[80vh]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-lg border border-secondary/50 overflow-hidden">
              <div className="bg-secondary/30 px-6 py-4 border-b border-secondary/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {dict.agenda?.pdfTitle || "MEF 2025 Agenda"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {locale === "mn" ? "Монгол хэл дээр" : "English version"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={pdfUrl}
                    download
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {dict.agenda?.download || "Download"}
                  </a>
                </div>
              </div>
              <div className="aspect-[8.5/11] sm:aspect-[8.5/11] md:h-[800px] bg-gray-100">
                <iframe
                  src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
                  className="w-full h-full"
                  title="Agenda PDF"
                />
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {dict.agenda?.pdfNote || "Can't see the PDF? "}
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {dict.agenda?.openNewTab || "Open in new tab"}
              </a>
            </p>
          </div>
        </section>
      )}

      {/* Sessions - Interactive View */}
      {viewMode === "interactive" && (
        <>
          <section className="py-16 bg-gradient-to-b from-white to-secondary/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Plenary Sessions */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {dict.agenda?.plenarySessions || "Plenary Sessions"}
                  </h2>
                </div>

                <div className="space-y-4">
                  {plenarySessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isExpanded={expandedSession === session.id}
                      onToggle={() => toggleSession(session.id)}
                      dict={dict}
                      isPrimary
                    />
                  ))}
                </div>
              </div>

              {/* Sub Sessions */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Users className="w-5 h-5 text-foreground" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {dict.agenda?.subSessions || "Sub-Sessions"}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {subSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      isExpanded={expandedSession === session.id}
                      onToggle={() => toggleSession(session.id)}
                      dict={dict}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Info Section */}
          <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {dict.agenda?.infoTitle || "Join the Discussion"}
              </h2>
              <p className="text-muted-foreground mb-8">
                {dict.agenda?.infoDescription || "Each session offers unique opportunities to engage with experts, policymakers, and industry leaders shaping Mongolia's future."}
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{dict.agenda?.twodays || "2 Days of Sessions"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mic2 className="w-4 h-4 text-primary" />
                  <span>{dict.agenda?.plenaryCount || "4 Plenary Sessions"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{dict.agenda?.subCount || "15 Sub-Sessions"}</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function SessionCard({
  session,
  isExpanded,
  onToggle,
  dict,
  isPrimary = false,
}: {
  session: Session
  isExpanded: boolean
  onToggle: () => void
  dict: any
  isPrimary?: boolean
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
        isPrimary
          ? "bg-gradient-to-r from-primary to-primary/90 text-white"
          : "bg-white border border-secondary/50 shadow-sm hover:shadow-md"
      } ${isExpanded ? "ring-2 ring-primary/50" : ""}`}
    >
      <button
        onClick={onToggle}
        className="w-full p-6 text-left flex items-start gap-4"
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isPrimary ? "bg-white/20" : "bg-primary/10"
          }`}
        >
          <span className={`text-sm font-bold ${isPrimary ? "text-white" : "text-primary"}`}>
            {session.id.split("-")[1]}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg ${isPrimary ? "text-white" : "text-foreground"}`}>
            {session.title}
          </h3>
          {session.titleMn && (
            <p className={`text-sm mt-1 ${isPrimary ? "text-white/70" : "text-muted-foreground"}`}>
              {session.titleMn}
            </p>
          )}
        </div>

        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
            isPrimary ? "text-white/70" : "text-muted-foreground"
          } ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className={`px-6 pb-6 space-y-4 ${isPrimary ? "text-white/90" : ""}`}>
          <div className={`h-px ${isPrimary ? "bg-white/20" : "bg-secondary"}`} />

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isPrimary ? "bg-white/10" : "bg-primary/5"
              }`}>
                <Lightbulb className={`w-4 h-4 ${isPrimary ? "text-white" : "text-primary"}`} />
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                  isPrimary ? "text-white/60" : "text-muted-foreground"
                }`}>
                  {dict.agenda?.importance || "Importance"}
                </p>
                <p className={`text-sm leading-relaxed ${isPrimary ? "text-white/80" : "text-muted-foreground"}`}>
                  {session.importance}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isPrimary ? "bg-white/10" : "bg-primary/5"
              }`}>
                <Target className={`w-4 h-4 ${isPrimary ? "text-white" : "text-primary"}`} />
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                  isPrimary ? "text-white/60" : "text-muted-foreground"
                }`}>
                  {dict.agenda?.purpose || "Purpose"}
                </p>
                <p className={`text-sm leading-relaxed ${isPrimary ? "text-white/80" : "text-muted-foreground"}`}>
                  {session.purpose}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isPrimary ? "bg-white/10" : "bg-primary/5"
              }`}>
                <CheckCircle2 className={`w-4 h-4 ${isPrimary ? "text-white" : "text-primary"}`} />
              </div>
              <div>
                <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                  isPrimary ? "text-white/60" : "text-muted-foreground"
                }`}>
                  {dict.agenda?.expectedOutcome || "Expected Outcome"}
                </p>
                <p className={`text-sm leading-relaxed ${isPrimary ? "text-white/80" : "text-muted-foreground"}`}>
                  {session.outcome}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
