import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getDictionary } from "@/lib/dictionary"
import type { Locale } from "@/lib/i18n"
import { ExternalLink, Calendar, Building2 } from "lucide-react"
import Link from "next/link"

const pressArticles = [
  {
    title: "Mongolia to Cooperate with The Asia Group to Improve Investment Climate",
    titleMn: "Монгол Улс хөрөнгө оруулалтын орчинг сайжруулахаар The Asia Group-тэй хамтран ажиллана",
    source: "Montsame",
    date: "2025-07-09",
    url: "https://montsame.mn/en/read/373913",
    description: "Mongolia's Ministry of Economy and Development has signed a Memorandum of Understanding with The Asia Group to strengthen the nation's investment climate.",
    descriptionMn: "Монгол Улсын Эдийн засаг, хөгжлийн яам The Asia Group-тэй хөрөнгө оруулалтын орчинг бэхжүүлэх талаар санамж бичигт гарын үсэг зурлаа.",
    image: "/Gallery/2025/516240243_1089178199942479_5869937902651617405_n.jpg",
  },
  {
    title: "Ulaanbaatar Mayor Signs MoU with UK Export Finance to Boost Metro Project",
    titleMn: "Улаанбаатар хотын дарга метроны төслийг дэмжих UK Export Finance-тай санамж бичиг зурлаа",
    source: "Montsame",
    date: "2025-07-09",
    url: "https://montsame.mn/en/read/373910",
    description: "Agreement focuses on supporting the Ulaanbaatar Metro development through UK goods, services, and financing arrangements.",
    descriptionMn: "Их Британийн бараа, үйлчилгээ, санхүүжилтийн зохицуулалтаар Улаанбаатар метроны хөгжлийг дэмжих гэрээ.",
    image: "/Gallery/2025/516433285_1089178179942481_715227763267332783_n.jpg",
  },
  {
    title: "Mongolia and France Sign Memorandum to Expand Civil Aviation Cooperation",
    titleMn: "Монгол, Франц иргэний нисэхийн хамтын ажиллагааг өргөжүүлэх санамж бичигт гарын үсэг зурлаа",
    source: "Montsame",
    date: "2025-07-09",
    url: "https://montsame.mn/en/read/373838",
    description: "Partnership covers air traffic management systems, training programs, equipment procurement, and workforce development.",
    descriptionMn: "Агаарын хөдөлгөөний удирдлагын систем, сургалтын хөтөлбөр, тоног төхөөрөмж худалдан авах, ажиллах хүчнийг хөгжүүлэх чиглэлээр хамтран ажиллана.",
    image: "/Gallery/2025/516437725_1088969326630033_5963285892912779978_n.jpg",
  },
  {
    title: "Mongolia at Davos 2025: AI and Emerging Industries",
    titleMn: "Монгол Улс Давос 2025: AI болон шинэ салбарууд",
    source: "The Diplomat",
    date: "2025-01-24",
    url: "https://thediplomat.com/2025/01/mongolia-at-davos-2025-ai-and-emerging-industries/",
    description: "Coverage of Mongolia's participation at the World Economic Forum Annual Meeting in Davos, Switzerland.",
    descriptionMn: "Швейцарийн Давост болсон Дэлхийн эдийн засгийн форумын жилийн уулзалтад Монгол Улсын оролцооны тухай.",
    image: "/Gallery/2025/516454690_1088344493359183_7195071777167754141_n.jpg",
  },
  {
    title: "Prime Minister Attends the Opening of Summer Davos",
    titleMn: "Ерөнхий сайд Зуны Давосын нээлтэд оролцлоо",
    source: "Montsame",
    date: "2023-06-27",
    url: "https://montsame.mn/en/read/322103",
    description: "Prime Minister L. Oyun-Erdene participated in the World Economic Forum's 14th Annual Meeting of New Champions in Tianjin, China.",
    descriptionMn: "Ерөнхий сайд Л.Оюун-Эрдэнэ БНХАУ-ын Тяньжинд болсон Дэлхийн эдийн засгийн форумын 14 дэх удаагийн Шинэ аваргуудын жилийн уулзалтад оролцов.",
    image: "/Gallery/2023/444022178_993555669504733_1447159889498588757_n.jpg",
  },
  {
    title: "Ambassador Attends 55th Annual Meeting of the World Economic Forum",
    titleMn: "Элчин сайд Дэлхийн эдийн засгийн форумын 55 дахь жилийн уулзалтад оролцлоо",
    source: "Embassy of Mongolia in Geneva",
    date: "2025-01-24",
    url: "https://geneva.embassy.mn/post/4769",
    description: "Ambassador Dorjkhand Togmid successfully attended the 55th Annual Meeting of the World Economic Forum from January 20-24, 2025, in Davos, Switzerland.",
    descriptionMn: "Элчин сайд Д.Тогмид 2025 оны 1-р сарын 20-24-нд Швейцарийн Давост болсон Дэлхийн эдийн засгийн форумын 55 дахь жилийн уулзалтад амжилттай оролцлоо.",
    image: "/Gallery/2025/516506138_1089160579944241_1756502182033702612_n.jpg",
  },
]

export default async function PressPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const dict = await getDictionary(locale)
  const isEn = locale === "en"

  return (
    <main className="min-h-screen">
      <Header locale={locale} dict={dict} />
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              {isEn ? "Media Coverage" : "Хэвлэл мэдээлэл"}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {isEn ? "Press" : "Мэдээлэл"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {isEn
                ? "News and media coverage about Mongolia Economic Forum and related events."
                : "Монголын Эдийн Засгийн Форум болон холбогдох арга хэмжээний талаарх мэдээ, мэдээлэл."}
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pressArticles.map((article, index) => (
              <Link
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={isEn ? article.title : article.titleMn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Source Badge Overlay */}
                  <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <div className="flex items-center gap-1.5 text-white">
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">{article.source}</span>
                    </div>
                  </div>
                  {/* External Link Icon */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(article.date).toLocaleDateString(isEn ? "en-US" : "mn-MN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}</span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {isEn ? article.title : article.titleMn}
                  </h3>

                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {isEn ? article.description : article.descriptionMn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer dict={dict} locale={locale} />
    </main>
  )
}
