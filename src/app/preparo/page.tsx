import type { Metadata } from "next";
import { MoonCard } from "@/components/moon-card";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Droplets,
  Flame,
  Hourglass,
  Leaf,
  Sparkles,
  TriangleAlert,
  Wind,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Como preparar banhos e defumações",
  description: "Guia básico para preparar as ervas em banhos e defumações: passo a passo, cuidados e combinações.",
};

const NAV = [
  { id: "antes", label: "Antes de começar" },
  { id: "banho", label: "Banho" },
  { id: "tipos", label: "Tipos de banho" },
  { id: "defumacao", label: "Defumação" },
  { id: "combinacoes", label: "Combinações" },
  { id: "incenso", label: "Incenso de maço" },
];

function Section({ id, icon, title, lead, children }: { id: string; icon: ReactNode; title: string; lead?: string; children: ReactNode }) {
  return (
    <section id={id} className="pv-section">
      <header className="pv-head">
        <span className="pv-head-icon" aria-hidden>
          {icon}
        </span>
        <div>
          <h2>{title}</h2>
          {lead ? <p>{lead}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="pv-steps">
      {items.map((s, i) => (
        <li key={i}>{s}</li>
      ))}
    </ol>
  );
}

function Note({ tone = "warn", title, children }: { tone?: "warn" | "info"; title: string; children: ReactNode }) {
  return (
    <aside className={`pv-note pv-note-${tone}`}>
      <TriangleAlert size={20} aria-hidden />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}

const TEMPS = [
  {
    key: "quente",
    name: "Quente",
    title: "Agressivas, de limpeza pesada",
    does: "Atuam como uma faxina profunda: dissolvem larvas astrais, miasmas, energias densas e cargas negativas pesadas.",
    care: "Use com moderação: o excesso ou o uso incorreto pode esgotar a energia vital ou causar desequilíbrio. Muitas não são indicadas para crianças pequenas ou peles sensíveis.",
  },
  {
    key: "morna",
    name: "Morna",
    title: "Equilibradoras e harmonizadoras",
    does: "Promovem o reajuste, a restauração e o equilíbrio da aura e dos chakras. Fazem a transição e suavizam o campo depois de uma erva forte.",
    care: "Têm uso mais livre e podem ser usadas com mais frequência; muitas são de uso diário.",
  },
  {
    key: "fria",
    name: "Fria",
    title: "Específicas, calmantes e atratoras",
    does: "Atuam de forma magnética e direcionada: acalmam a mente, trazem paz, atraem e magnetizam bons fluidos, fecham o campo ou incentivam estados específicos, como intuição e mediunidade.",
    care: "Geralmente aplicadas depois da limpeza, na etapa de imantação.",
  },
] as const;

const COMBOS: { group: string; items: { herbs: string[]; effect: string }[] }[] = [
  {
    group: "Descarrego",
    items: [
      { herbs: ["Alecrim", "Cardo-santo"], effect: "Espantam inveja e olho gordo." },
      { herbs: ["Benjoim", "Canela", "Casca de alho", "Folha de fumo", "Mirra"], effect: "Purificam o ambiente." },
      { herbs: ["Guiné"], effect: "Barra mal-feito e quebra feitiço dos ambientes." },
      { herbs: ["Arruda"], effect: "Descarrego e defesa; remove o efeito de feitiços." },
      { herbs: ["Cipó-caboclo"], effect: "Elimina larvas astrais do ambiente." },
      {
        herbs: ["Eucalipto", "Casca de alho", "Palha de cana seca", "Folha de bambu", "Pinhão-roxo"],
        effect: "Descargas fortes.",
      },
      { herbs: ["Manjericão", "Alecrim", "Mirra", "Alfazema", "Arruda"], effect: "Energias muito pesadas." },
    ],
  },
  {
    group: "Atrair e harmonizar",
    items: [
      { herbs: ["Abre-caminho", "Levante"], effect: "Atraem bons fluidos, força e liderança." },
      { herbs: ["Alfazema", "Macela"], effect: "Acalmam, atraem boas amizades e protegem o lar." },
      { herbs: ["Anis-estrelado"], effect: "Chama boa sorte." },
      { herbs: ["Manjericão", "Sândalo"], effect: "Amor e espiritualidade positiva." },
      { herbs: ["Rosa-branca"], effect: "Paz e harmonia." },
      { herbs: ["Alecrim", "Abre-caminho", "Hortelã", "Levante", "Girassol", "Cana"], effect: "Ajudam no comércio." },
    ],
  },
];

export default function PreparoPage() {
  return (
    <div className="container pv">
      <header className="pv-hero">
        <h1 className="page-title">Como preparar as ervas</h1>
        <p className="page-lead">Banhos e defumações, do jeito simples: o que fazer, em que ordem e quais cuidados ter.</p>

        <div className="pv-choice">
          <a href="#banho" className="pv-choice-card pv-water">
            <Droplets size={30} aria-hidden />
            <strong>Banho de ervas</strong>
            <span>Maceração, infusão e como tomar</span>
          </a>
          <a href="#defumacao" className="pv-choice-card pv-fire">
            <Flame size={30} aria-hidden />
            <strong>Defumação</strong>
            <span>Carvão, ervas secas e como defumar</span>
          </a>
        </div>

        <nav className="pv-nav chip-row is-scroll" aria-label="Nesta página">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className="chip">
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="pv-section">
        <MoonCard />
      </div>

      <Section id="antes" icon={<Leaf size={22} />} title="Antes de começar">
        <div className="pv-grid-2">
          <div className="pv-card">
            <h3>Erva fresca</h3>
            <p>Guarda a água e a força vegetal. Ideal para o banho, em maceração.</p>
          </div>
          <div className="pv-card">
            <h3>Erva seca</h3>
            <p>Mais concentrada. Serve para banho (infusão) e é a <strong>única</strong> que vai na defumação.</p>
          </div>
        </div>

        <div className="pv-temps">
          <h3 className="pv-sub">O que significa a temperatura da erva</h3>
          {TEMPS.map((t) => (
            <div key={t.key} className={`pv-card pv-temp-card pv-temp-${t.key}`}>
              <span className={`chip chip-temp-${t.key}`}>{t.name}</span>
              <h3>{t.title}</h3>
              <dl>
                <dt>O que fazem</dt>
                <dd>{t.does}</dd>
                <dt>Cuidados</dt>
                <dd>{t.care}</dd>
              </dl>
            </div>
          ))}
          <p className="pv-small">
            Veja a temperatura de cada erva no <Link href="/ervas">guia de ervas</Link>.
          </p>
        </div>

        <Note title="Cuidado com as ervas quentes">
          Não tome muitos banhos seguidos só com elas e faça um teste de alergia: esfregue um pedaço pequeno no antebraço
          e espere. Algumas são tóxicas e não vão no banho (como a comigo-ninguém-pode). Leia a página de cada erva.
        </Note>
        <p className="pv-small">
          Resinas (incenso, mirra e benjoim) são só para defumação. No banho, use a essência ou a própria erva.
        </p>
      </Section>

      <Section id="banho" icon={<Droplets size={22} />} title="Banho de ervas" lead="Duas formas de preparar. Escolha conforme a erva que você tem.">
        <div className="pv-grid-2">
          <div className="pv-card pv-method">
            <span className="pv-tag">Ervas frescas</span>
            <h3>Maceração</h3>
            <Steps
              items={[
                "Lave as ervas em água corrente.",
                "Numa bacia com água fria, amasse com as mãos.",
                "Deixe descansar um pouco e depois coe.",
              ]}
            />
          </div>
          <div className="pv-card pv-method">
            <span className="pv-tag">Ervas secas</span>
            <h3>Infusão</h3>
            <Steps
              items={[
                "Ferva a água e, ao levantar fervura, coloque as ervas.",
                "Deixe ferver rapidamente e desligue.",
                "Tampe e deixe amornar.",
              ]}
            />
          </div>
        </div>
        <p className="pv-small">Dá para juntar os dois: ferva as secas, deixe amornar e macere esse preparo com as frescas.</p>

        <h3 className="pv-sub">Na hora de tomar</h3>
        <Steps
          items={[
            <>
              Tome primeiro o <strong>banho normal</strong>, de asseio.
            </>,
            <>
              <strong>Coe</strong> o preparo e complete com água do chuveiro até ficar <strong>morno</strong>.
            </>,
            "Jogue suavemente, do pescoço para baixo, com o pensamento no que você pede. Se quiser, reze ou cante um ponto.",
            "Fique alguns instantes sem enxaguar e sem enxugar, respirando fundo sete vezes.",
            "Prefira à noite, antes de dormir. Banhos estimulantes, de manhã ou 4 horas antes do sono.",
          ]}
        />

        <div className="pv-grid-2">
          <div className="pv-card">
            <h3>Vai na cabeça?</h3>
            <p>
              Pela apostila, só o banho do <strong>orixá de cabeça</strong>, salvo se a entidade ou o dirigente pedirem
              outra coisa. Ervas quentes costumam ser evitadas ali. Na dúvida, pergunte ao dirigente da sua casa.
            </p>
          </div>
          <div className="pv-card">
            <h3>Depois do banho</h3>
            <p>
              Devolva as ervas à natureza: jardim, vaso, pé de árvore ou rio. No rio, jogue só o resíduo vegetal, sem
              sacola plástica.
            </p>
          </div>
        </div>
      </Section>

      <Section id="tipos" icon={<Sparkles size={22} />} title="Tipos de banho">
        <div className="pv-grid-2">
          <div className="pv-card">
            <span className="chip chip-temp-quente">Ervas quentes</span>
            <h3>Descarrego</h3>
            <p>Limpa o campo e elimina cargas pesadas. Depois do banho de asseio, e sempre seguido de energização.</p>
          </div>
          <div className="pv-card">
            <span className="chip chip-temp-morna">Ervas mornas</span>
            <h3>Energização</h3>
            <p>Firma as correntes benéficas e reenergiza. De preferência com as ervas dos orixás da pessoa.</p>
          </div>
          <div className="pv-card">
            <span className="chip">Rituais da casa</span>
            <h3>Litúrgicos</h3>
            <p>Amaci, abô e outros, feitos sempre sob a direção dos dirigentes.</p>
          </div>
          <div className="pv-card">
            <span className="chip">Ambientes</span>
            <h3>Para a casa</h3>
            <p>Passe no chão com pano branco, nos batentes e nas paredes que aceitem líquido (cuidado com a tinta).</p>
          </div>
        </div>
      </Section>

      <Section id="defumacao" icon={<Flame size={22} />} title="Defumação" lead="Só com ervas secas. Ervas frescas têm água e não queimam bem.">
        <div className="pv-card">
          <h3>O que você vai precisar</h3>
          <div className="chip-row">
            <span className="chip">Carvão</span>
            <span className="chip">Álcool em gel</span>
            <span className="chip">Incensário</span>
            <span className="chip">Ervas secas</span>
          </div>
          <p className="pv-small">
            Sem incensário, uma lata de chocolate ou de leite em pó furada embaixo e com alça comprida de arame funciona.
          </p>
        </div>

        <h3 className="pv-sub">Acendendo</h3>
        <Steps
          items={[
            "Coloque o álcool em gel no fundo, o carvão por cima e um pouco mais de álcool sobre ele.",
            "Acenda e espere alguns minutos até virar brasa. Balance a lata pela alça, com cuidado, ou sopre.",
            "Com o carvão em brasa, coloque as ervas secas.",
          ]}
        />

        <h3 className="pv-sub">Por onde defumar</h3>
        <div className="pv-grid-2">
          <div className="pv-card pv-route">
            <ArrowUp size={26} aria-hidden />
            <h3>Descarrego</h3>
            <p>
              De <strong>dentro para fora</strong>: do fundo da casa até a porta de saída, passando por todos os cômodos.
            </p>
          </div>
          <div className="pv-card pv-route">
            <ArrowDown size={26} aria-hidden />
            <h3>Lustral</h3>
            <p>
              <strong>Da porta para o fundo</strong>, por todos os cômodos. Abre caminhos, harmoniza e energiza.
            </p>
          </div>
        </div>
        <p className="pv-small">
          Dá para combinar: comece pelo descarrego e depois faça a lustral. Reze, cante ou mentalize o objetivo o tempo todo.
        </p>

        <Note title="Segurança" tone="info">
          Deixe o ambiente ventilado, longe de cortinas e coisas inflamáveis, e cuidado com queimaduras e com pessoas que
          tenham problemas respiratórios.
        </Note>
      </Section>

      <Section id="combinacoes" icon={<Wind size={22} />} title="Combinações de ervas" lead="Sugestões de misturas para a defumação.">
        {COMBOS.map((g) => (
          <div key={g.group} className="pv-combo-group">
            <h3 className="pv-sub">{g.group}</h3>
            <ul className="pv-combos">
              {g.items.map((c, i) => (
                <li key={i} className="pv-card">
                  <div className="chip-row">
                    {c.herbs.map((h) => (
                      <span key={h} className="chip chip-herb">
                        {h}
                      </span>
                    ))}
                  </div>
                  <p>{c.effect}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section id="incenso" icon={<Hourglass size={22} />} title="Incenso de maço" lead="Um defumador natural para fazer em casa.">
        <Steps
          items={[
            "Junte as ervas escolhidas, com um galho no centro, bem distribuídas.",
            "Enrole com corda natural, bem apertado: as ervas encolhem ao secar.",
            "Deixe num lugar quente e seco até secar por completo. Erva com seiva pode não queimar.",
            "Acenda uma ponta como incenso, em lugar ventilado e longe de objetos inflamáveis.",
          ]}
        />
        <div className="pv-card">
          <h3>Boas ervas para isso</h3>
          <div className="chip-row">
            {["Alecrim", "Alfazema", "Arruda", "Cedro", "Erva-cidreira", "Hortelã", "Louro", "Manjericão", "Orégano", "Rosa", "Sálvia", "Tomilho", "Canela em pau"].map(
              (h) => (
                <span key={h} className="chip chip-herb">
                  {h}
                </span>
              ),
            )}
          </div>
        </div>
      </Section>

      <p className="pv-foot">
        Cada casa tem a sua doutrina: na dúvida, siga a orientação do seu dirigente. Isto não é orientação médica.
      </p>
      <p>
        <Link href="/ervas" className="btn btn-primary">
          Ver o guia de ervas
        </Link>
      </p>
    </div>
  );
}
