import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, TriangleAlert } from "lucide-react";
import { FavoriteButton, ListButton } from "@/components/herb-actions";
import { HerbCard } from "@/components/herb-card";
import { HerbFacts } from "@/components/herb-facts";
import { RichText } from "@/components/rich-text";
import { imageUrl } from "@/lib/herb-utils";
import { getHerb, getHerbs } from "@/lib/server/api";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getHerb(slug);
  if (!data) return { title: "Erva não encontrada" };
  return {
    title: data.name,
    description: data.summary,
    openGraph: {
      title: `${data.name} | Herbá`,
      description: data.summary,
      images: data.cover ? [imageUrl(data.cover.file)] : undefined,
    },
  };
}

export default async function HerbPage({ params }: Props) {
  const { slug } = await params;
  const { data: herb, status } = await getHerb(slug);

  if (!herb) {
    if (status === 404) notFound();
    return (
      <div className="container">
        <p className="empty">Não foi possível carregar esta erva agora. Tente novamente em instantes.</p>
      </div>
    );
  }

  const hero = herb.images[0];
  const gallery = herb.images.slice(1);
  const sections = herb.sections.filter((s) => s.id !== "cuidados");
  const care = herb.sections.find((s) => s.id === "cuidados");

  const all = await getHerbs();
  const related = (all ?? [])
    .filter(
      (h) =>
        h.slug !== herb.slug &&
        (h.orixas.some((o) => herb.orixas.some((ho) => ho.slug === o.slug)) ||
          h.functions.some((f) => herb.functions.includes(f))) &&
        h.temperature === herb.temperature,
    )
    .slice(0, 4);

  return (
    <article className="container">
      <nav className="crumbs" aria-label="Você está em">
        <Link href="/ervas" className="chip">
          <ArrowLeft size={14} aria-hidden /> Guia de ervas
        </Link>
      </nav>

      <header className="wiki-hero">
        {hero ? (
          <figure className="wiki-hero-photo">
            <Image
              src={imageUrl(hero.file)}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              sizes="(min-width: 900px) 50vw, 100vw"
              priority
              unoptimized
            />
            <figcaption>
              {hero.credit}, {hero.sourceUrl ? "licença " : ""}
              {hero.sourceUrl ? (
                <a href={hero.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {hero.license}
                </a>
              ) : (
                hero.license
              )}
            </figcaption>
          </figure>
        ) : null}

        <div className="wiki-title-block">
          <h1>{herb.name}</h1>
          {herb.scientificName ? <p className="sci">{herb.scientificName}</p> : null}
          {herb.alternativeNames.length > 0 ? (
            <p className="alt-names">Também conhecida como {herb.alternativeNames.join(", ")}.</p>
          ) : null}
          <p className="page-lead" style={{ margin: 0 }}>
            {herb.mainUse}
          </p>
          <HerbFacts herb={herb} linked />
          <div className="hero-actions">
            <Link href={`/?erva=${herb.slug}`} className="btn btn-primary">
              <MapPin size={18} aria-hidden />
              Ver no mapa
            </Link>
            <FavoriteButton slug={herb.slug} name={herb.name} className="btn btn-icon" />
            <ListButton slug={herb.slug} name={herb.name} className="btn" withLabel />
          </div>
        </div>
      </header>

      {herb.hasRisk && herb.riskNote ? (
        <aside className="callout" style={{ marginTop: 22 }} role="note">
          <h2>
            <TriangleAlert size={18} aria-hidden style={{ verticalAlign: -3 }} /> Atenção
          </h2>
          <p style={{ margin: 0 }}>{herb.riskNote}</p>
        </aside>
      ) : null}

      <div className="wiki-layout">
        <nav className="toc" aria-label="Nesta página">
          <h2>Nesta página</h2>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.title}
            </a>
          ))}
          {care ? <a href="#cuidados">{care.title}</a> : null}
          {gallery.length > 0 ? <a href="#fotos">Fotos</a> : null}
          <a href="#fontes">Fontes</a>
        </nav>

        <div className="wiki-article">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="wiki-section">
              <h2>{s.title}</h2>
              <RichText text={s.body} />
            </section>
          ))}

          {care ? (
            <section id="cuidados" className="callout">
              <h2>{care.title}</h2>
              <RichText text={care.body} />
            </section>
          ) : null}

          {herb.classificationNote ? (
            <section className="wiki-section">
              <h2>Sobre a classificação</h2>
              <RichText text={herb.classificationNote} />
            </section>
          ) : null}

          {gallery.length > 0 ? (
            <section id="fotos" className="wiki-section">
              <h2>Fotos</h2>
              <div className="gallery">
                {gallery.map((img) => (
                  <figure key={img.file}>
                    <Image
                      src={imageUrl(img.file)}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      sizes="(min-width: 560px) 50vw, 100vw"
                      loading="lazy"
                      unoptimized
                    />
                    <figcaption>
                      {img.credit}, {img.sourceUrl ? "licença " : ""}
                      {img.sourceUrl ? (
                        <a href={img.sourceUrl} target="_blank" rel="noopener noreferrer">
                          {img.license}
                        </a>
                      ) : (
                        img.license
                      )}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <p>
            <Link href="/preparo" className="chip">
              Como preparar banhos e defumações
            </Link>
          </p>

          <section id="fontes" className="wiki-section">
            <h2>Fontes consultadas</h2>
            <ul className="sources">
              {herb.sources.map((s) => (
                <li key={s.id}>{s.label}</li>
              ))}
            </ul>
            <p className="disclaimer">
              A Umbanda é oral e cada casa tem a sua doutrina. Em caso de diferença entre as
              fontes, vale a apostila de ervas e, depois, o livro Rituais com Ervas. Este conteúdo não substitui a orientação do dirigente da sua casa nem a de um
              profissional de saúde.
            </p>
          </section>

          {related.length > 0 ? (
            <section className="wiki-section">
              <h2>Ervas parecidas</h2>
              <div className="herb-grid">
                {related.map((h) => (
                  <HerbCard key={h.slug} herb={h} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
