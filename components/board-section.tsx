import { Linkedin } from "lucide-react"
import Link from "next/link"

interface BoardSectionProps {
  dict: any
}

const linkedinUrls: Record<string, string> = {
  ganhuyag: "https://www.linkedin.com/in/ganhuyag/",
  battushig: "https://www.linkedin.com/in/battushig-batbold-b6838a64/",
  byambasaikhan: "https://www.linkedin.com/in/byambasaikhan/",
  ganzorig: "https://www.linkedin.com/in/ganzorigvanchig/",
}

export function BoardSection({ dict }: BoardSectionProps) {
  const memberKeys = ["ganhuyag", "battushig", "byambasaikhan", "ganzorig"]

  return (
    <section id="board" className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            {dict.board.label}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">{dict.board.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.board.description}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {memberKeys.map((key) => {
            const member = dict.board.members[key]
            return (
              <div
                key={key}
                className="bg-secondary/30 rounded-2xl p-6 text-center hover:bg-secondary/50 transition-colors group"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {member.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-lg">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-1">{member.role}</p>
                <p className="text-muted-foreground text-xs mb-4">{member.position}</p>
                <Link
                  href={linkedinUrls[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  <span className="text-sm">LinkedIn</span>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
