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
            const photo = member?.photo
            return (
              <div
                key={key}
                className="bg-secondary/30 rounded-2xl p-6 text-center hover:bg-secondary/50 transition-colors group"
              >
                <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden border border-primary/10">
                  {photo ? (
                    <img
                      src={photo}
                      alt={member.name}
                      className={[
                        "w-full h-full object-cover",
                        // Ганхуяг-ийн зургийг томруулах
                        key === "ganhuyag" ? "scale-125" : "",
                        // 2 дахь member-ийн image дээр нүүрийг дээш/доош нь тааруулах
                        key === memberKeys[1] ? "object-[center_15%]" : "object-center",
                      ].join(" ")}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {member.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-lg whitespace-nowrap overflow-hidden text-ellipsis">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-1">{member.role}</p>
                <p className="text-muted-foreground text-xs mb-4">{member.position}</p>
                <Link
                  href={linkedinUrls[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                  aria-label={`Open ${member.name}'s LinkedIn profile`}
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
