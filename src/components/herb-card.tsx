import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { LinkChips, TemperatureChip } from "@/components/chips";
import { thumbUrl } from "@/lib/herb-utils";
import type { HerbCard as HerbCardData } from "@/types/herb";

export function HerbThumb({
  herb,
  size = 420,
  priority = false,
}: {
  herb: HerbCardData;
  size?: number;
  priority?: boolean;
}) {
  if (!herb.cover) {
    return (
      <span className="thumb-fallback" aria-hidden>
        <Leaf size={36} />
      </span>
    );
  }
  return (
    <Image
      src={thumbUrl(herb.cover.file)}
      alt={herb.cover.alt}
      width={size}
      height={Math.round(size * 0.75)}
      sizes="(min-width: 1180px) 25vw, (min-width: 900px) 33vw, (min-width: 560px) 50vw, 100vw"
      priority={priority}
      unoptimized
    />
  );
}

export function HerbCard({ herb, priority = false }: { herb: HerbCardData; priority?: boolean }) {
  return (
    <Link href={`/ervas/${herb.slug}`} className="herb-card">
      <div className="herb-thumb">
        <HerbThumb herb={herb} priority={priority} />
        <TemperatureChip temperature={herb.temperature} />
      </div>
      <div className="herb-card-body">
        <h3>{herb.name}</h3>
        {herb.scientificName ? <p className="sci">{herb.scientificName}</p> : null}
        <p className="herb-card-use">{herb.mainUse}</p>
        <LinkChips items={herb.orixas} kind="orixa" limit={3} />
      </div>
    </Link>
  );
}
