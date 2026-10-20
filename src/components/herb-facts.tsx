import { FunctionChips, LinkChips, TemperatureChip } from "@/components/chips";
import { TEMPERATURE_META } from "@/lib/herb-utils";
import type { HerbCard } from "@/types/herb";

/**
 * As quatro informações que toda erva tem: orixás, povos, temperatura e função.
 * Mesma ordem no mapa e na wiki.
 */
export function HerbFacts({
  herb,
  linked = false,
  compact = false,
}: {
  herb: HerbCard;
  linked?: boolean;
  compact?: boolean;
}) {
  return (
    <dl className={compact ? "sheet-facts" : "facts"}>
      <div className="fact">
        <dt>Orixás</dt>
        <dd>
          {herb.orixas.length > 0 ? (
            <LinkChips items={herb.orixas} kind="orixa" linked={linked} />
          ) : (
            <span className="fact-note">A apostila não informa o orixá desta erva.</span>
          )}
        </dd>
      </div>
      <div className="fact">
        <dt>Povos</dt>
        <dd>
          {herb.povos.length > 0 ? (
            <LinkChips items={herb.povos} kind="povo" linked={linked} />
          ) : (
            <span className="fact-note">Nenhum povo específico nas fontes.</span>
          )}
        </dd>
      </div>
      <div className="fact">
        <dt>Temperatura</dt>
        <dd>
          <TemperatureChip temperature={herb.temperature} />
          {compact ? null : (
            <p className="fact-note">{TEMPERATURE_META[herb.temperature].hint}</p>
          )}
        </dd>
      </div>
      <div className="fact">
        <dt>Função</dt>
        <dd>
          <FunctionChips slugs={herb.functions} linked={linked} />
          
        </dd>
      </div>
    </dl>
  );
}
