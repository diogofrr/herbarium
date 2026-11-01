"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Lock, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useHerbCatalog, useTaxonomy } from "@/hooks";
import {
  createAdminHerb,
  fetchAdminHerb,
  fetchAdminUsers,
  removeHerbPhoto,
  saveAdminHerb,
  updateAdminUser,
  unlockAdminHerb,
  uploadHerbPhoto,
} from "@/lib/api/account";
import { fold, imageUrl, isUploadedImage } from "@/lib/herb-utils";
import { PhotoCropper } from "@/components/photo-cropper";
import { compressPhoto, type PhotoCrop } from "@/lib/image";
import type { AdminHerb, AdminUser, HerbSection, Taxonomy, Temperature } from "@/types/herb";

type Tab = "ervas" | "usuarios";

function toggleIn(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function ChipPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { slug: string; name: string }[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="admin-field">
      <legend>{label}</legend>
      <div className="chip-row">
        {options.map((o) => (
          <button
            key={o.slug}
            type="button"
            className={`chip${value.includes(o.slug) ? " is-on" : ""}`}
            aria-pressed={value.includes(o.slug)}
            onClick={() => onChange(toggleIn(value, o.slug))}
          >
            {o.name}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** slug null = erva nova (ainda não existe; as fotos só entram depois de criar). */
function HerbEditor({
  slug,
  taxonomy,
  onBack,
  onCreated,
}: {
  slug: string | null;
  taxonomy: Taxonomy | undefined;
  onBack: () => void;
  onCreated: (slug: string) => void;
}) {
  const [herb, setHerb] = useState<AdminHerb | null>(null);
  const [photoAlt, setPhotoAlt] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [alt, setAlt] = useState("");
  const [temperature, setTemperature] = useState<Temperature>("morna");
  const [mainUse, setMainUse] = useState("");
  const [summary, setSummary] = useState("");
  const [functions, setFunctions] = useState<string[]>([]);
  const [orixas, setOrixas] = useState<string[]>([]);
  const [povos, setPovos] = useState<string[]>([]);
  const [hasRisk, setHasRisk] = useState(false);
  const [riskNote, setRiskNote] = useState("");
  const [sections, setSections] = useState<HerbSection[]>([]);

  const load = (h: AdminHerb) => {
    setHerb(h);
    setName(h.name);
    setAlt(h.alternativeNames.join(", "));
    setTemperature(h.temperature);
    setMainUse(h.mainUse);
    setSummary(h.summary);
    setFunctions(h.functions);
    setOrixas(h.orixas.map((o) => o.slug));
    setPovos(h.povos.map((p) => p.slug));
    setHasRisk(h.hasRisk);
    setRiskNote(h.riskNote ?? "");
    setSections(h.sections.map((s) => ({ ...s })));
  };

  useEffect(() => {
    if (slug === null) return;
    let alive = true;
    fetchAdminHerb(slug)
      .then((h) => alive && load(h))
      .catch((e: Error) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [slug]);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    setError(null);
    try {
      const body = {
        name: name.trim(),
        alternativeNames: alt.split(",").map((s) => s.trim()).filter(Boolean),
        temperature,
        mainUse: mainUse.trim(),
        summary: summary.trim(),
        functions,
        orixas,
        povos,
        hasRisk,
        riskNote: riskNote.trim(),
        sections: sections.filter((s) => s.title.trim()),
      };
      if (slug === null) {
        const created = await createAdminHerb(body);
        onCreated(created.slug);
        return;
      }
      const saved = await saveAdminHerb(slug, body);
      load(saved);
      setMsg("Salvo. A página pública já mostra a mudança.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const addPhoto = async (file: File, crop: PhotoCrop) => {
    if (slug === null || !herb) return;
    setPendingPhoto(null);
    setPhotoBusy(true);
    setPhotoError(null);
    try {
      const { mime, data, width, height } = await compressPhoto(file, crop);
      const saved = await uploadHerbPhoto(slug, {
        mime,
        data,
        width,
        height,
        alt: photoAlt.trim() || `Foto de ${herb.name}`,
      });
      setHerb(saved);
      setPhotoAlt("");
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "Não foi possível enviar a foto.");
    } finally {
      setPhotoBusy(false);
    }
  };

  const dropPhoto = async (file: string) => {
    if (slug === null || !window.confirm("Remover esta foto?")) return;
    setPhotoError(null);
    try {
      setHerb(await removeHerbPhoto(slug, file.slice(2)));
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "Não foi possível remover a foto.");
    }
  };

  const unlock = async () => {
    if (slug === null) return;
    try {
      load(await unlockAdminHerb(slug));
      setMsg("Erva liberada: volta ao texto original no próximo início do servidor.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível liberar.");
    }
  };

  if (slug !== null && !herb) {
    return (
      <div>
        <button type="button" className="btn" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden /> Voltar
        </button>
        <p className="pv-small" style={{ marginTop: 12 }}>
          {error ?? "Carregando…"}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-form">
      <div className="admin-bar">
        <button type="button" className="btn" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden /> Voltar
        </button>
        {slug !== null ? (
          <Link href={`/ervas/${slug}`} className="btn">
            Ver página
          </Link>
        ) : null}
        {herb?.locked ? (
          <button type="button" className="btn" onClick={() => void unlock()} title="Volta ao texto do seed no próximo início do servidor">
            <RotateCcw size={16} aria-hidden /> Restaurar original
          </button>
        ) : null}
      </div>

      <h2 className="admin-title">{herb?.name ?? "Nova erva"}</h2>
      {herb?.locked ? (
        <p className="pv-small">
          <Lock size={13} aria-hidden style={{ verticalAlign: -2 }} /> Editada por você: as atualizações automáticas não
          sobrescrevem esta erva.
        </p>
      ) : null}

      <section className="admin-card" aria-labelledby="admin-basic">
      <h3 id="admin-basic">Informações básicas</h3>
      <div className="admin-grid">
        <label className="admin-field">
          <span>Nome</span>
          <input value={name} maxLength={80} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="admin-field">
          <span>Outros nomes (separe por vírgula)</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} />
        </label>
      </div>

      <fieldset className="admin-field">
        <legend>Temperatura</legend>
        <div className="chip-row">
          {(["quente", "morna", "fria"] as const).map((t) => (
            <button
              key={t}
              type="button"
              className={`chip chip-temp-${t}${temperature === t ? " is-on" : ""}`}
              aria-pressed={temperature === t}
              onClick={() => setTemperature(t)}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="admin-field">
        <span>Principal uso (frase curta)</span>
        <input value={mainUse} maxLength={240} onChange={(e) => setMainUse(e.target.value)} />
      </label>
      <label className="admin-field">
        <span>Resumo</span>
        <textarea value={summary} rows={3} maxLength={600} onChange={(e) => setSummary(e.target.value)} />
      </label>
      </section>

      <section className="admin-card" aria-labelledby="admin-class">
      <h3 id="admin-class">Classificação</h3>
      <ChipPicker
        label="Funções"
        options={(taxonomy?.functions ?? []).map((f) => ({ slug: f.slug, name: f.label }))}
        value={functions}
        onChange={setFunctions}
      />
      <ChipPicker label="Orixás" options={taxonomy?.orixas ?? []} value={orixas} onChange={setOrixas} />
      <ChipPicker label="Povos" options={taxonomy?.povos ?? []} value={povos} onChange={setPovos} />
      </section>

      <fieldset className="admin-field admin-card">
        <legend>Cuidado</legend>
        <label className="admin-check">
          <input type="checkbox" checked={hasRisk} onChange={(e) => setHasRisk(e.target.checked)} />
          Esta erva exige cuidado (tóxica ou irritante)
        </label>
        <textarea
          value={riskNote}
          rows={2}
          maxLength={600}
          placeholder="Aviso que aparece na página da erva"
          aria-label="Aviso de cuidado"
          onChange={(e) => setRiskNote(e.target.value)}
        />
      </fieldset>

      <fieldset className="admin-field admin-card">
        <legend>Seções do texto</legend>
        {sections.map((s, i) => (
          <div key={i} className="admin-section">
            <div className="admin-section-head">
              <input
                value={s.title}
                maxLength={120}
                aria-label="Título da seção"
                onChange={(e) => setSections((all) => all.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
              />
              <button
                type="button"
                className="btn btn-icon admin-remove"
                aria-label={`Remover seção ${s.title}`}
                title="Remover seção"
                onClick={() => setSections((all) => all.filter((_, j) => j !== i))}
              >
                <Trash2 size={16} aria-hidden />
              </button>
            </div>
            <textarea
              value={s.body}
              rows={5}
              maxLength={6000}
              aria-label={`Texto da seção ${s.title}`}
              onChange={(e) => setSections((all) => all.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))}
            />
          </div>
        ))}
        <button
          type="button"
          className="btn"
          onClick={() =>
            setSections((all) => [...all, { id: `secao-${all.length + 1}-${Date.now() % 10000}`, title: "Nova seção", body: "" }])
          }
        >
          <Plus size={14} aria-hidden /> Adicionar seção
        </button>
        <p className="pv-small">Use **negrito** e linhas começando com &quot;- &quot; para listas.</p>
      </fieldset>

      {herb ? (
        <fieldset className="admin-field admin-card">
          <legend>Fotos</legend>
          <div className="admin-photos">
            {herb.images.map((img) => (
              <figure key={img.file}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl(img.file)} alt={img.alt} width={120} height={120} loading="lazy" />
                {isUploadedImage(img.file) ? (
                  <button type="button" className="btn btn-danger" onClick={() => void dropPhoto(img.file)}>
                    <Trash2 size={14} aria-hidden /> Remover
                  </button>
                ) : (
                  <figcaption className="pv-small">Foto original</figcaption>
                )}
              </figure>
            ))}
          </div>
          <div className="admin-upload">
            <input
              value={photoAlt}
              maxLength={160}
              placeholder="Descrição da foto (opcional)"
              aria-label="Descrição da foto"
              onChange={(e) => setPhotoAlt(e.target.value)}
            />
            <label className={`btn btn-primary${photoBusy ? " is-disabled" : ""}`}>
              <ImagePlus size={16} aria-hidden /> {photoBusy ? "Enviando…" : "Enviar foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                disabled={photoBusy}
                onChange={(e) => {
                  setPendingPhoto(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <PhotoCropper
            file={pendingPhoto}
            onCancel={() => setPendingPhoto(null)}
            onConfirm={(file, crop) => void addPhoto(file, crop)}
          />
          {photoError ? (
            <p role="alert" className="form-error">
              {photoError}
            </p>
          ) : null}
          <p className="pv-small">Até 8 fotos enviadas por erva. Fotos originais do guia não podem ser removidas.</p>
        </fieldset>
      ) : (
        <p className="pv-small">Crie a erva primeiro: depois você poderá enviar fotos.</p>
      )}

      <div className="admin-save">
        {error ? (
          <p role="alert" className="form-error">
            {error}
          </p>
        ) : null}
        {msg ? <p role="status" className="pv-small">{msg}</p> : null}
        <button
          type="button"
          className="btn btn-primary"
          disabled={saving || !name.trim() || (slug === null && (!mainUse.trim() || !summary.trim()))}
          onClick={() => void save()}
        >
          {saving ? "Salvando…" : slug === null ? "Criar erva" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user: me } = useAuth();

  useEffect(() => {
    fetchAdminUsers().then(setUsers).catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p role="alert" className="form-error">{error}</p>;
  if (!users) return <p className="pv-small">Carregando…</p>;

  return (
    <ul className="admin-users">
      {users.map((u) => (
        <li key={u.id} className="pv-card">
          <div>
            <strong>{u.name}</strong>
            <small>{u.email}</small>
            <small>
              {u.role === "ADMIN" ? "Administrador · " : u.role === "HERBMASTER" ? "Mantenedor · " : ""}
              {u.markers} marcações · desde {new Date(u.createdAt).toLocaleDateString("pt-BR")}
            </small>
          </div>
          {u.id === me?.id || u.role === "ADMIN" ? null : (
            <div className="chip-row">
              <button
                type="button"
                className="btn"
                onClick={() =>
                  updateAdminUser(u.id, { role: u.role === "HERBMASTER" ? "USER" : "HERBMASTER" })
                    .then(setUsers)
                    .catch((e: Error) => setError(e.message))
                }
              >
                {u.role === "HERBMASTER" ? "Remover mantenedor" : "Tornar mantenedor"}
              </button>
              <button
                type="button"
                className={`btn${u.isActive ? " btn-danger" : ""}`}
                onClick={() =>
                  updateAdminUser(u.id, { isActive: !u.isActive })
                    .then(setUsers)
                    .catch((e: Error) => setError(e.message))
                }
              >
                {u.isActive ? "Desativar" : "Reativar"}
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const catalog = useHerbCatalog();
  const taxonomy = useTaxonomy();
  const [tab, setTab] = useState<Tab>("ervas");
  const [slug, setSlug] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const needle = fold(q);
    const all = catalog.data ?? [];
    return (needle ? all.filter((h) => fold(h.name).includes(needle)) : all).slice(0, 40);
  }, [catalog.data, q]);

  if (isLoading) return <div className="container" />;
  const isAdmin = user?.role === "ADMIN";
  if (!isAdmin && user?.role !== "HERBMASTER") {
    return (
      <div className="container acct">
        <h1 className="page-title">Administração</h1>
        <p className="page-lead">Esta área é só para o administrador e os mantenedores do guia.</p>
      </div>
    );
  }

  return (
    <div className="container admin">
      <h1 className="page-title">Administração</h1>
      {isAdmin ? (
        <div className="chip-row" role="tablist" aria-label="Seções">
          {(["ervas", "usuarios"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              className={`chip${tab === t ? " is-on" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "ervas" ? "Ervas" : "Usuários"}
            </button>
          ))}
        </div>
      ) : null}

      {isAdmin && tab === "usuarios" ? (
        <Users />
      ) : creating || slug ? (
        <HerbEditor
          key={creating ? "nova" : slug}
          slug={creating ? null : slug}
          taxonomy={taxonomy.data}
          onBack={() => {
            setCreating(false);
            setSlug(null);
          }}
          onCreated={(created) => {
            setCreating(false);
            setSlug(created);
          }}
        />
      ) : (
        <div>
          <button type="button" className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setCreating(true)}>
            <Plus size={16} aria-hidden /> Nova erva
          </button>
          <div className="search-box" style={{ margin: "16px 0" }}>
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={q}
              placeholder="Buscar erva para editar"
              aria-label="Buscar erva para editar"
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <ul className="admin-herbs">
            {results.map((h) => (
              <li key={h.slug}>
                <button type="button" className="pv-card" onClick={() => setSlug(h.slug)}>
                  <strong>{h.name}</strong>
                  <small>{h.mainUse}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
